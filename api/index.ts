/**
 * Vercel / Cloudflare Serverless Entrypoint (`api/index.ts`)
 * Re-exports the production FrontPage99 API handler from `src/backend/api-worker.ts`
 */

export {
  handleFrontPage99ApiRequest,
  type PostgresPoolAdapter,
  type SqlTransactionClient,
} from '../src/backend/api-worker';
