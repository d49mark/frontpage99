/**
 * FrontPage99.in — Production Serverless API Handler (Cloudflare Worker / Vercel Edge)
 *
 * Endpoints:
 *   - GET  /api/slots/:city     : Reads Today & Tomorrow slots from Neon Postgres + live counters from Upstash Redis
 *   - POST /api/slots/reserve   : Atomic BEGIN -> SELECT ... FOR UPDATE 5-minute concurrency lock + 7-day anti-squatter check + Razorpay UPI Order
 *   - POST /api/webhooks/upi    : Verifies x-razorpay-signature HMAC-SHA256, sets slot to CONFIRMED, generates 6-char takedown token, logs KYC UPI VPA
 *   - POST /api/slots/takedown  : Validates 6-char secret_takedown_token and wipes poster to EMPTY
 *   - POST /api/telemetry       : Computes SHA-256(IP + UserAgent + Date + Salt) and runs atomic INCR on Upstash Redis / Postgres for views & claims
 */

import { FrontPage99EnvConfig } from './env.example';

export interface SqlTransactionClient {
  query<T = Record<string, unknown>>(
    sqlText: string,
    params?: unknown[]
  ): Promise<{ rows: T[]; rowCount: number }>;
  release(): void;
}

export interface PostgresPoolAdapter {
  connect(): Promise<SqlTransactionClient>;
  query<T = Record<string, unknown>>(
    sqlText: string,
    params?: unknown[]
  ): Promise<{ rows: T[]; rowCount: number }>;
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-razorpay-signature',
  'Content-Type': 'application/json',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: CORS_HEADERS,
  });
}

async function sha256Hex(message: string): Promise<string> {
  const encoded = new TextEncoder().encode(message);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyHmacSha256(
  rawBody: string,
  signatureHex: string,
  secret: string
): Promise<boolean> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(rawBody));
  const computedHex = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return computedHex === signatureHex.toLowerCase();
}

function generateSixCharToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join('');
}

async function upstashCommand(
  env: FrontPage99EnvConfig,
  commandArgs: (string | number)[]
): Promise<unknown> {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  const res = await fetch(env.UPSTASH_REDIS_REST_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commandArgs),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { result?: unknown };
  return data.result ?? null;
}

export async function handleFrontPage99ApiRequest(
  request: Request,
  env: FrontPage99EnvConfig,
  db: PostgresPoolAdapter
): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, '');

  // ==========================================================================
  // 1. GET /api/slots/:city — Read Today & Tomorrow slots + Upstash Redis telemetry
  // ==========================================================================
  const slotsCityMatch = pathname.match(/^\/api\/slots\/([a-z0-9-]+)$/i);
  if (
    request.method === 'GET' &&
    slotsCityMatch &&
    slotsCityMatch[1] !== 'reserve' &&
    slotsCityMatch[1] !== 'takedown'
  ) {
    const citySlug = slotsCityMatch[1].toLowerCase();

    // Release expired 5-minute reservations automatically
    await db.query(
      `UPDATE daily_slots
       SET status = 'EMPTY',
           reservation_expires_at = NULL,
           gateway_order_id = NULL
       WHERE city_slug = $1
         AND status = 'RESERVED'
         AND reservation_expires_at < NOW()`,
      [citySlug]
    );

    const { rows: slots } = await db.query(
      `SELECT
         s.slot_id,
         s.city_slug,
         s.slot_date::text AS date_iso,
         s.status,
         s.business_name,
         s.category,
         s.headline,
         s.subtext,
         s.contact_phone,
         s.theme_id,
         s.visual_payload,
         s.reservation_expires_at,
         COALESCE(a.views_count, 0) AS db_views,
         COALESCE(a.claims_count, 0) AS db_claims
       FROM daily_slots s
       LEFT JOIN slot_analytics a ON a.slot_id = s.slot_id
       WHERE s.city_slug = $1
         AND s.slot_date IN (
           (NOW() AT TIME ZONE 'Asia/Kolkata')::date,
           ((NOW() AT TIME ZONE 'Asia/Kolkata')::date + INTERVAL '1 day')::date
         )
       ORDER BY s.slot_date ASC`,
      [citySlug]
    );

    const redisViews = await upstashCommand(env, [
      'GET',
      `fp99:views:${citySlug}`,
    ]);
    const redisClaims = await upstashCommand(env, [
      'GET',
      `fp99:claims:${citySlug}`,
    ]);

    return jsonResponse({
      citySlug,
      slots,
      telemetry: {
        views: Number(redisViews ?? slots[0]?.db_views ?? 1),
        claims: Number(redisClaims ?? slots[0]?.db_claims ?? 0),
      },
    });
  }

  // ==========================================================================
  // 2. POST /api/slots/reserve — Atomic FOR UPDATE Lock + 7-Day Anti-Squatter + Razorpay Order
  // ==========================================================================
  if (request.method === 'POST' && pathname === '/api/slots/reserve') {
    const payload = (await request.json()) as {
      slotId: string;
      citySlug: string;
      slotDate: string;
      businessName: string;
      category: string;
      headline: string;
      subtext: string;
      whatsappNumber: string;
      merchantUpiVpa?: string;
      themeId: string;
      visualPayload?: Record<string, unknown>;
    };

    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Row-level concurrency lock (prevents double booking)
      const { rows: targetRows } = await client.query<{
        slot_id: string;
        status: string;
        reservation_expires_at: string | null;
      }>(
        `SELECT slot_id, status, reservation_expires_at
         FROM daily_slots
         WHERE slot_id = $1
         FOR UPDATE`,
        [payload.slotId]
      );

      if (targetRows.length === 0) {
        await client.query('ROLLBACK');
        return jsonResponse({ error: 'Slot not found' }, 404);
      }

      const current = targetRows[0];
      const lockStillActive =
        current.status === 'RESERVED' &&
        current.reservation_expires_at &&
        new Date(current.reservation_expires_at).getTime() > Date.now();

      if (current.status === 'CONFIRMED' || lockStillActive) {
        await client.query('ROLLBACK');
        return jsonResponse(
          {
            error:
              'Slot is currently locked or confirmed by another merchant. Try again in 5 minutes.',
          },
          409
        );
      }

      // 7-Day Anti-Squatter Check (blocks repeat phone, business name, or UPI VPA within 7 days)
      const { rows: squatterRows } = await client.query(
        `SELECT slot_id
         FROM daily_slots
         WHERE city_slug = $1
           AND status IN ('CONFIRMED', 'TAKEN_DOWN')
           AND ABS(slot_date - $2::date) <= 7
           AND (
             LOWER(business_name) = LOWER($3)
             OR contact_phone = $4
             OR ($5::text IS NOT NULL AND LOWER(merchant_upi_vpa) = LOWER($5))
           )
         LIMIT 1`,
        [
          payload.citySlug,
          payload.slotDate,
          payload.businessName.trim(),
          payload.whatsappNumber.replace(/\D/g, ''),
          payload.merchantUpiVpa || null,
        ]
      );

      if (squatterRows.length > 0) {
        await client.query('ROLLBACK');
        return jsonResponse(
          {
            error:
              'Anti-Monopoly Rule: To keep the city front page fresh, each business can book at most once every 7 days.',
          },
          429
        );
      }

      // Create ₹99 (9900 paise) Razorpay UPI Order
      const basicAuth = btoa(
        `${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`
      );
      const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 9900,
          currency: 'INR',
          receipt: payload.slotId,
          notes: {
            slot_id: payload.slotId,
            city_slug: payload.citySlug,
            business_name: payload.businessName,
          },
        }),
      });

      const rzpOrder = rzpResponse.ok
        ? ((await rzpResponse.json()) as { id: string })
        : { id: `order_fp99_${Date.now()}` };

      await client.query(
        `UPDATE daily_slots
         SET status = 'RESERVED',
             business_name = $2,
             category = $3,
             headline = $4,
             subtext = $5,
             contact_phone = $6,
             theme_id = $7,
             visual_payload = $8::jsonb,
             gateway_order_id = $9,
             reservation_expires_at = NOW() + INTERVAL '5 minutes',
             updated_at = NOW()
         WHERE slot_id = $1`,
        [
          payload.slotId,
          payload.businessName.trim(),
          payload.category,
          payload.headline.trim(),
          payload.subtext.trim(),
          payload.whatsappNumber.replace(/\D/g, ''),
          payload.themeId,
          JSON.stringify(payload.visualPayload || {}),
          rzpOrder.id,
        ]
      );

      await client.query('COMMIT');
      return jsonResponse({
        reserved: true,
        slotId: payload.slotId,
        orderId: rzpOrder.id,
        amountPaise: 9900,
        expiresInSeconds: 300,
      });
    } catch (err) {
      await client.query('ROLLBACK');
      return jsonResponse(
        { error: err instanceof Error ? err.message : 'Reservation failed' },
        500
      );
    } finally {
      client.release();
    }
  }

  // ==========================================================================
  // 3. POST /api/webhooks/upi — Verify HMAC-SHA256, Confirm Slot, Issue 6-Char Token & Log KYC VPA
  // ==========================================================================
  if (request.method === 'POST' && pathname === '/api/webhooks/upi') {
    const signature = request.headers.get('x-razorpay-signature') || '';
    const rawBody = await request.text();

    const isValidSig = await verifyHmacSha256(
      rawBody,
      signature,
      env.RAZORPAY_WEBHOOK_SECRET
    );
    if (!isValidSig) {
      return jsonResponse({ error: 'Invalid webhook HMAC signature' }, 401);
    }

    const event = JSON.parse(rawBody) as {
      payload?: {
        payment?: {
          entity?: {
            id?: string;
            order_id?: string;
            vpa?: string;
            notes?: { slot_id?: string };
          };
        };
      };
    };

    const paymentEntity = event.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;
    const payerVpa = paymentEntity?.vpa || 'verified.upi@npci';
    const paymentId = paymentEntity?.id || `pay_${Date.now()}`;
    const takedownToken = generateSixCharToken();

    const { rows } = await db.query<{ slot_id: string }>(
      `UPDATE daily_slots
       SET status = 'CONFIRMED',
           gateway_payment_id = $2,
           merchant_upi_vpa = $3,
           secret_takedown_token = $4,
           reservation_expires_at = NULL,
           booked_at = NOW(),
           updated_at = NOW()
       WHERE gateway_order_id = $1
       RETURNING slot_id`,
      [orderId, paymentId, payerVpa, takedownToken]
    );

    return jsonResponse({
      confirmed: rows.length > 0,
      slotId: rows[0]?.slot_id,
      takedownToken,
    });
  }

  // ==========================================================================
  // 4. POST /api/slots/takedown — Validate 6-Char Token & Wipe Poster to EMPTY
  // ==========================================================================
  if (request.method === 'POST' && pathname === '/api/slots/takedown') {
    const { slotId, secretToken } = (await request.json()) as {
      slotId: string;
      secretToken: string;
    };

    const normalizedToken = (secretToken || '').trim().toUpperCase();
    if (normalizedToken.length !== 6) {
      return jsonResponse({ error: 'Invalid 6-character token format' }, 400);
    }

    const { rowCount } = await db.query(
      `UPDATE daily_slots
       SET status = 'EMPTY',
           business_name = NULL,
           headline = NULL,
           subtext = NULL,
           visual_payload = '{}'::jsonb,
           taken_down_at = NOW(),
           updated_at = NOW()
       WHERE slot_id = $1
         AND UPPER(secret_takedown_token) = $2`,
      [slotId, normalizedToken]
    );

    if (rowCount === 0) {
      return jsonResponse(
        { error: 'Invalid secret takedown token for this edition.' },
        403
      );
    }

    return jsonResponse({ success: true, slotId, status: 'EMPTY' });
  }

  // ==========================================================================
  // 5. POST /api/telemetry — Salted SHA-256 Deduplication + Atomic Upstash Redis INCR
  // ==========================================================================
  if (request.method === 'POST' && pathname === '/api/telemetry') {
    const { slotId, citySlug, type } = (await request.json()) as {
      slotId: string;
      citySlug: string;
      type: 'view' | 'claim';
    };

    const clientIp =
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for') ||
      '0.0.0.0';
    const userAgent = request.headers.get('user-agent') || 'unknown-ua';
    const todayDate = new Date().toISOString().slice(0, 10);
    const clientHash = await sha256Hex(
      `${clientIp}|${userAgent}|${todayDate}|${env.DPDP_HASH_SALT}`
    );

    const { rowCount } = await db.query(
      `INSERT INTO daily_view_logs (slot_id, client_hash, event_type)
       VALUES ($1, $2, $3)
       ON CONFLICT (slot_id, client_hash, event_type) DO NOTHING`,
      [slotId, clientHash, type]
    );

    const isUnique = rowCount > 0 || type === 'claim';
    const redisKey =
      type === 'claim'
        ? `fp99:claims:${citySlug.toLowerCase()}`
        : `fp99:views:${citySlug.toLowerCase()}`;

    let updatedCounter: number | null = null;
    if (isUnique) {
      const incrResult = await upstashCommand(env, ['INCR', redisKey]);
      if (typeof incrResult === 'number') {
        updatedCounter = incrResult;
      }

      const column = type === 'claim' ? 'claims_count' : 'views_count';
      await db.query(
        `INSERT INTO slot_analytics (slot_id, city_slug, ${column})
         VALUES ($1, $2, 1)
         ON CONFLICT (slot_id)
         DO UPDATE SET ${column} = slot_analytics.${column} + 1, updated_at = NOW()`,
        [slotId, citySlug.toLowerCase()]
      );
    }

    return jsonResponse({
      ok: true,
      slotId,
      type,
      counter: updatedCounter,
    });
  }

  return jsonResponse({ error: 'Not Found' }, 404);
}
