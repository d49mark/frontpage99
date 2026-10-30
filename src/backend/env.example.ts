/**
 * FrontPage99.in — Environment Variables & 1-Click Deployment Guide
 * Stack: Cloudflare Pages / Vercel + Neon/Supabase Serverless Postgres + Upstash Redis + Razorpay/Cashfree UPI
 */

export interface FrontPage99EnvConfig {
  /** Neon.tech or Supabase PostgreSQL pooled connection URI */
  DATABASE_URL: string;
  /** Upstash Redis REST endpoint for atomic telemetry counters & 5-minute slot locks */
  UPSTASH_REDIS_REST_URL: string;
  /** Upstash Redis REST bearer token */
  UPSTASH_REDIS_REST_TOKEN: string;
  /** Razorpay Live/Test Key ID for ₹99 (9900 paise) UPI Intent orders */
  RAZORPAY_KEY_ID: string;
  /** Razorpay Key Secret for server-side order creation */
  RAZORPAY_KEY_SECRET: string;
  /** Razorpay Webhook Secret for HMAC-SHA256 x-razorpay-signature verification */
  RAZORPAY_WEBHOOK_SECRET: string;
  /** Secret salt for DPDP-compliant SHA-256(IP + UserAgent + Date + Salt) unique view deduplication */
  DPDP_HASH_SALT: string;
}

export const ENV_EXAMPLE_TEMPLATE = `
# 1. Neon.tech / Supabase Serverless PostgreSQL (ap-south-1 / ap-southeast-1)
DATABASE_URL="postgresql://neondb_owner:password@ep-frontpage99.ap-southeast-1.aws.neon.tech/frontpage99?sslmode=require"

# 2. Upstash Serverless Redis (Free Tier — 10,000 commands/day)
UPSTASH_REDIS_REST_URL="https://apn1-frontpage99.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AX_your_upstash_rest_token"

# 3. Razorpay UPI Gateway (Flat ₹99 = 9900 paise)
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="xxxxxxxxxxxxxxxxxxxxxxxx"
RAZORPAY_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxxxx"

# 4. DPDP Act 2023 Salted SHA-256 Telemetry Deduplication
DPDP_HASH_SALT="fp99_dpdp_2026_secret_salt"
`.trim();

export const ONE_CLICK_DEPLOYMENT_STEPS = [
  '1. Provision a free Neon.tech PostgreSQL database and run `src/backend/schema.sql`.',
  '2. Create a free Upstash Redis database and copy UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.',
  '3. Configure Razorpay webhook pointing to `https://frontpage99.in/api/webhooks/upi` with event `payment.captured`.',
  '4. Deploy to Cloudflare Pages (`wrangler pages deploy dist`) or Vercel (`vercel --prod`) with the environment variables above.',
];
