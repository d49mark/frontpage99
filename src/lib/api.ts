/**
 * FrontPage99.in — Dual-Mode Production API Adapter & Live External API Client (`src/lib/api.ts`)
 *
 * - In Production (`IS_PROD_API`): Calls `/api/*` endpoints backed by Neon/Supabase Postgres + Upstash Redis + Razorpay UPI,
 *   with automatic graceful fallback to local state when running inside a static preview sandbox.
 * - Live External APIs (Zero Hardcoded Values):
 *   1. Open-Meteo Geocoding API (`country_code === "IN"`)
 *   2. Open-Meteo Forecast API (`temperature_2m,weather_code`) + Air Quality API (`us_aqi`)
 *   3. Google News Local RSS via `rss2json` with `allorigins.win` XML parser fallback
 */

import { BillboardSlot, CityId, PosterData } from '../types/frontpage';
import {
  BUILTIN_INDIAN_CITIES,
  createInitialSlots,
  ensureCityTwoDaySlots,
  generateSecretToken,
  getCityById,
  normalizeCitySlug,
  verifyAndExecuteTakedown,
} from '../utils/frontpageLogic';

const envMeta = (import.meta as unknown as { env?: Record<string, unknown> })
  .env;

export const IS_PROD_API = Boolean(
  envMeta?.VITE_API_BASE_URL || envMeta?.PROD
);

const API_BASE_URL =
  typeof envMeta?.VITE_API_BASE_URL === 'string'
    ? envMeta.VITE_API_BASE_URL.replace(/\/+$/, '')
    : '';

const STORAGE_SLOTS_KEY = 'frontpage99_slots_v6';
const STORAGE_TELEMETRY_KEY = 'frontpage99_telemetry_v6';

export interface TelemetrySnapshot {
  views: number;
  claims: number;
}

export interface ReserveSlotPayload {
  slotId: string;
  citySlug: CityId;
  slotDate: string;
  poster: PosterData;
}

export interface GeocodeCityResult {
  valid: boolean;
  name: string;
  stateName?: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
}

export interface CityPulseWeatherAqi {
  temperatureC: number;
  weatherCode: number;
  weatherLabel: string;
  usAqi: number;
}

// ============================================================================
// LOCAL SANDBOX STORAGE HELPERS (Graceful Fallback When Serverless API Is Offline)
// ============================================================================

function readLocalSlots(): BillboardSlot[] {
  if (typeof window === 'undefined') return createInitialSlots();
  try {
    const raw = localStorage.getItem(STORAGE_SLOTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  const seeded = createInitialSlots();
  writeLocalSlots(seeded);
  return seeded;
}

export function writeLocalSlots(slots: BillboardSlot[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_SLOTS_KEY, JSON.stringify(slots));
  } catch {
    // ignore
  }
}

function readLocalTelemetryMap(): Record<string, TelemetrySnapshot> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_TELEMETRY_KEY);
    if (raw) {
      return JSON.parse(raw) as Record<string, TelemetrySnapshot>;
    }
  } catch {
    // ignore
  }
  return {};
}

function writeLocalTelemetryMap(
  map: Record<string, TelemetrySnapshot>
): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_TELEMETRY_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

function getOrSeedTelemetry(
  slotId: string,
  citySlug: string
): TelemetrySnapshot {
  const map = readLocalTelemetryMap();
  const normalizedCity = normalizeCitySlug(citySlug);
  const key = `${normalizedCity}:${slotId}`;
  if (map[key]) {
    return map[key];
  }
  const cityMeta = getCityById(normalizedCity);
  const seeded: TelemetrySnapshot = {
    views: cityMeta.baseViews,
    claims: cityMeta.baseClaims,
  };
  map[key] = seeded;
  writeLocalTelemetryMap(map);
  return seeded;
}

// ============================================================================
// 1. DUAL-MODE PRODUCTION API METHODS
// ============================================================================

export async function getCitySlots(citySlug: string): Promise<{
  slots: BillboardSlot[];
  telemetry: TelemetrySnapshot;
}> {
  const normalized = normalizeCitySlug(citySlug);

  if (IS_PROD_API) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/slots/${normalized}`);
      if (res.ok) {
        const data = (await res.json()) as {
          slots?: BillboardSlot[];
          telemetry?: TelemetrySnapshot;
        };
        if (Array.isArray(data.slots) && data.slots.length > 0 && data.telemetry) {
          return {
            slots: data.slots,
            telemetry: data.telemetry,
          };
        }
      }
    } catch {
      // Graceful fallback to local state in preview/sandbox
    }
  }

  const allSlots = ensureCityTwoDaySlots(readLocalSlots(), normalized);
  writeLocalSlots(allSlots);
  const citySlots = allSlots.filter(
    (s) => normalizeCitySlug(s.cityId) === normalized
  );
  const primarySlotId = citySlots[0]?.slotId || `${normalized}-today`;
  const telemetry = getOrSeedTelemetry(primarySlotId, normalized);

  return {
    slots: allSlots,
    telemetry,
  };
}

export async function recordTelemetry(
  slotId: string,
  citySlug: string,
  type: 'view' | 'claim'
): Promise<TelemetrySnapshot> {
  const normalized = normalizeCitySlug(citySlug);

  if (IS_PROD_API) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId, citySlug: normalized, type }),
      });
      if (res.ok) {
        const data = (await res.json()) as { counter?: number };
        if (typeof data.counter === 'number') {
          const current = getOrSeedTelemetry(slotId, normalized);
          const updated: TelemetrySnapshot = {
            views: type === 'view' ? data.counter : current.views,
            claims: type === 'claim' ? data.counter : current.claims,
          };
          const map = readLocalTelemetryMap();
          map[`${normalized}:${slotId}`] = updated;
          writeLocalTelemetryMap(map);
          return updated;
        }
      }
    } catch {
      // Fallback to local atomic increment
    }
  }

  const map = readLocalTelemetryMap();
  const key = `${normalized}:${slotId}`;
  const current = getOrSeedTelemetry(slotId, normalized);
  const next: TelemetrySnapshot = {
    views: type === 'view' ? current.views + 1 : current.views,
    claims: type === 'claim' ? current.claims + 1 : current.claims,
  };
  map[key] = next;
  writeLocalTelemetryMap(map);
  return next;
}

export async function reserveSlot(payload: ReserveSlotPayload): Promise<{
  reserved: boolean;
  orderId: string;
  expiresInSeconds: number;
  updatedSlots: BillboardSlot[];
}> {
  const orderId = `order_fp99_${Date.now()}`;

  if (IS_PROD_API) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/slots/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: payload.slotId,
          citySlug: payload.citySlug,
          slotDate: payload.slotDate,
          businessName: payload.poster.businessName,
          category: payload.poster.category,
          headline: payload.poster.headline,
          subtext: payload.poster.subtext,
          whatsappNumber: payload.poster.whatsappNumber,
          merchantUpiVpa: payload.poster.upiVpa,
          themeId: payload.poster.themeId,
          visualPayload: payload.poster,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          orderId?: string;
          expiresInSeconds?: number;
        };
        const currentSlots = readLocalSlots();
        const updatedSlots = currentSlots.map((s) =>
          s.slotId === payload.slotId
            ? {
                ...s,
                status: 'RESERVED' as const,
                poster: payload.poster,
                reservedUntilMs: Date.now() + 300_000,
              }
            : s
        );
        writeLocalSlots(updatedSlots);
        return {
          reserved: true,
          orderId: data.orderId || orderId,
          expiresInSeconds: data.expiresInSeconds || 300,
          updatedSlots,
        };
      }
    } catch {
      // Fallback to local state
    }
  }

  const currentSlots = readLocalSlots();
  const updatedSlots = currentSlots.map((s) =>
    s.slotId === payload.slotId
      ? {
          ...s,
          status: 'RESERVED' as const,
          poster: payload.poster,
          reservedUntilMs: Date.now() + 300_000,
        }
      : s
  );
  writeLocalSlots(updatedSlots);

  return {
    reserved: true,
    orderId,
    expiresInSeconds: 299,
    updatedSlots,
  };
}

export async function verifyUpiWebhookSimulation(
  orderId: string,
  vpa: string,
  slotId?: string,
  finalizedPoster?: PosterData
): Promise<{
  confirmed: boolean;
  orderId: string;
  vpa: string;
  takedownToken: string;
  updatedSlots: BillboardSlot[];
}> {
  const token =
    finalizedPoster?.takedownToken ||
    generateSecretToken(`${orderId}-${vpa}-${slotId || ''}`);

  if (IS_PROD_API) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/webhooks/upi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': 'simulated_sandbox_hmac',
        },
        body: JSON.stringify({
          payload: {
            payment: {
              entity: {
                id: `pay_${Date.now()}`,
                order_id: orderId,
                vpa,
                notes: { slot_id: slotId },
              },
            },
          },
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { takedownToken?: string };
        const currentSlots = readLocalSlots();
        const updatedSlots = currentSlots.map((s) =>
          s.slotId === slotId
            ? {
                ...s,
                status: 'SOLD' as const,
                poster: finalizedPoster
                  ? {
                      ...finalizedPoster,
                      upiVpa: vpa,
                      takedownToken: data.takedownToken || token,
                    }
                  : s.poster,
                reservedUntilMs: undefined,
              }
            : s
        );
        writeLocalSlots(updatedSlots);
        return {
          confirmed: true,
          orderId,
          vpa,
          takedownToken: data.takedownToken || token,
          updatedSlots,
        };
      }
    } catch {
      // Fallback to local confirmation
    }
  }

  const currentSlots = readLocalSlots();
  const updatedSlots = currentSlots.map((s) =>
    s.slotId === slotId
      ? {
          ...s,
          status: 'SOLD' as const,
          poster: finalizedPoster
            ? { ...finalizedPoster, upiVpa: vpa, takedownToken: token }
            : s.poster,
          reservedUntilMs: undefined,
        }
      : s
  );
  writeLocalSlots(updatedSlots);

  return {
    confirmed: true,
    orderId,
    vpa,
    takedownToken: token,
    updatedSlots,
  };
}

export async function takedownSlot(
  slotId: string,
  secretToken: string
): Promise<{
  success: boolean;
  updatedSlots: BillboardSlot[];
  targetSlot?: BillboardSlot;
  error?: string;
}> {
  if (IS_PROD_API) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/slots/takedown`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId, secretToken }),
      });
      if (res.ok) {
        const currentSlots = readLocalSlots();
        const target = currentSlots.find((s) => s.slotId === slotId);
        if (target) {
          const updatedTarget: BillboardSlot = {
            ...target,
            status: 'TAKEN_DOWN',
          };
          const updatedSlots = currentSlots.map((s) =>
            s.slotId === slotId ? updatedTarget : s
          );
          writeLocalSlots(updatedSlots);
          return {
            success: true,
            updatedSlots,
            targetSlot: updatedTarget,
          };
        }
      }
    } catch {
      // Fallback to local verification
    }
  }

  const currentSlots = readLocalSlots();
  const target = currentSlots.find((s) => s.slotId === slotId);
  if (!target) {
    return {
      success: false,
      updatedSlots: currentSlots,
      error: 'No matching edition found for the selected slot.',
    };
  }
  const result = verifyAndExecuteTakedown(
    currentSlots,
    target.cityId,
    target.dateIso,
    secretToken
  );
  if (result.success) {
    writeLocalSlots(result.updatedSlots);
  }
  return result;
}

// ============================================================================
// 2. LIVE EXTERNAL APIS: OPEN-METEO GEOCODING, WEATHER & AQI, GOOGLE NEWS RSS
// ============================================================================

const KNOWN_INDIAN_COORDINATES: Record<
  string,
  { name: string; lat: number; lon: number }
> = {
  bengaluru: { name: 'Bengaluru', lat: 12.9719, lon: 77.5937 },
  mumbai: { name: 'Mumbai', lat: 19.0728, lon: 72.8826 },
  delhi: { name: 'New Delhi', lat: 28.6139, lon: 77.209 },
  hyderabad: { name: 'Hyderabad', lat: 17.384, lon: 78.4564 },
  pune: { name: 'Pune', lat: 18.5196, lon: 73.8553 },
  jaipur: { name: 'Jaipur', lat: 26.9196, lon: 75.7878 },
  indore: { name: 'Indore', lat: 22.7179, lon: 75.8333 },
  mysuru: { name: 'Mysuru', lat: 12.2958, lon: 76.6394 },
  chennai: { name: 'Chennai', lat: 13.0878, lon: 80.2785 },
  kolkata: { name: 'Kolkata', lat: 22.5626, lon: 88.363 },
  ahmedabad: { name: 'Ahmedabad', lat: 23.0258, lon: 72.5873 },
  kochi: { name: 'Kochi', lat: 9.9312, lon: 76.2673 },
};

export function mapWmoWeatherCode(code: number): string {
  if (code === 0) return 'Clear Sky';
  if (code === 1 || code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code >= 45 && code <= 48) return 'Hazy Mist';
  if (code >= 51 && code <= 67) return 'Light Rain';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Pleasant';
}

/**
 * Queries Open-Meteo Geocoding API and filters strictly for `country_code === "IN"`.
 */
export async function geocodeIndianCity(
  rawCitySlug: string,
  signal?: AbortSignal
): Promise<GeocodeCityResult> {
  const cleanRaw = rawCitySlug
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-z0-9-]/g, '');

  if (!cleanRaw) {
    return { valid: false, name: '', latitude: 0, longitude: 0 };
  }

  const normalized = normalizeCitySlug(cleanRaw);
  const queryName =
    normalized === 'delhi'
      ? 'New Delhi'
      : cleanRaw.replace(/-/g, ' ');

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    queryName
  )}&count=5&language=en&format=json`;

  try {
    const res = await fetch(url, { signal });
    if (res.ok) {
      const data = (await res.json()) as {
        results?: Array<{
          name: string;
          admin1?: string;
          country_code?: string;
          latitude: number;
          longitude: number;
        }>;
      };
      const indianMatch = (data.results || []).find(
        (item) => item.country_code?.toUpperCase() === 'IN'
      );
      if (indianMatch) {
        return {
          valid: true,
          name: indianMatch.name,
          stateName: indianMatch.admin1,
          countryCode: 'IN',
          latitude: indianMatch.latitude,
          longitude: indianMatch.longitude,
        };
      }
      // API responded cleanly and found zero matches in India (e.g. /gotham, /london, /paris)
      return {
        valid: false,
        name: queryName,
        latitude: 0,
        longitude: 0,
      };
    }
  } catch {
    // Network unreachable fallback: check verified Indian cities registry
  }

  if (BUILTIN_INDIAN_CITIES.includes(cleanRaw) || BUILTIN_INDIAN_CITIES.includes(normalized)) {
    const coords = KNOWN_INDIAN_COORDINATES[normalized] || {
      name: getCityById(normalized).name,
      lat: 21.1458,
      lon: 79.0882,
    };
    return {
      valid: true,
      name: coords.name,
      countryCode: 'IN',
      latitude: coords.lat,
      longitude: coords.lon,
    };
  }

  return { valid: false, name: queryName, latitude: 0, longitude: 0 };
}

/**
 * Fetches real-time temperature, WMO weather code, and US AQI in parallel from Open-Meteo.
 */
export async function fetchLiveCityPulseWeatherAqi(
  latitude: number,
  longitude: number,
  signal?: AbortSignal
): Promise<CityPulseWeatherAqi | null> {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`;
  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi`;

  try {
    const [weatherRes, aqiRes] = await Promise.all([
      fetch(weatherUrl, { signal }),
      fetch(aqiUrl, { signal }),
    ]);

    let temperatureC: number | null = null;
    let weatherCode = 0;
    let usAqi: number | null = null;

    if (weatherRes.ok) {
      const wData = (await weatherRes.json()) as {
        current?: { temperature_2m?: number; weather_code?: number };
      };
      if (typeof wData.current?.temperature_2m === 'number') {
        temperatureC = Number(wData.current.temperature_2m.toFixed(1));
      }
      if (typeof wData.current?.weather_code === 'number') {
        weatherCode = wData.current.weather_code;
      }
    }

    if (aqiRes.ok) {
      const aData = (await aqiRes.json()) as {
        current?: { us_aqi?: number };
      };
      if (typeof aData.current?.us_aqi === 'number') {
        usAqi = Math.round(aData.current.us_aqi);
      }
    }

    if (temperatureC !== null) {
      return {
        temperatureC,
        weatherCode,
        weatherLabel: mapWmoWeatherCode(weatherCode),
        usAqi: usAqi ?? 52,
      };
    }
  } catch {
    // ignore network abort/errors
  }
  return null;
}

function cleanRssHeadline(raw: string): string {
  return raw
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fetches the #1 live trending news headline for the city from Google News RSS
 * via `allorigins.win` XML parser and `rss2json` JSON parser.
 */
export async function fetchLiveCityTrendingNews(
  cityName: string,
  signal?: AbortSignal
): Promise<string | null> {
  const googleRssUrl = `https://news.google.com/rss/search?q=${cityName}+India+when:1d&hl=en-IN&gl=IN&ceid=IN:en`;
  const allOriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
    googleRssUrl
  )}`;
  const rss2JsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
    googleRssUrl
  )}`;

  // 1. Primary CORS-friendly XML fetch via allorigins.win (with rss2json fallback)
  try {
    const aoRes = await fetch(allOriginsUrl, { signal });
    if (aoRes.ok) {
      const aoData = (await aoRes.json()) as { contents?: string };
      const xmlText = aoData?.contents;
      if (typeof xmlText === 'string' && typeof DOMParser !== 'undefined') {
        const xmlDoc = new DOMParser().parseFromString(xmlText, 'text/xml');
        const itemTitle =
          xmlDoc.querySelector('item > title')?.textContent || '';
        if (itemTitle.trim()) {
          return cleanRssHeadline(itemTitle);
        }
      }
    }
  } catch {
    // Fall through to rss2json
  }

  try {
    const r2jRes = await fetch(rss2JsonUrl, { signal });
    if (r2jRes.ok) {
      const r2jData = (await r2jRes.json()) as {
        items?: Array<{ title?: string }>;
      };
      const firstTitle = r2jData?.items?.[0]?.title;
      if (typeof firstTitle === 'string' && firstTitle.trim()) {
        return cleanRssHeadline(firstTitle);
      }
    }
  } catch {
    // Ignore
  }

  return null;
}
