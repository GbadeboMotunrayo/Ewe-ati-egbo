import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV ?? 'development';
const isProd = nodeEnv === 'production';

// Values that must never reach production (copied from .env.example or code defaults).
const KNOWN_PLACEHOLDERS = new Set(['', 'dev-secret', 'change-me', 'sk_test_your_secret_key']);

/** Read a secret; in production it must be set to a real, non-placeholder value. */
function secret(name: string, devFallback: string, minLength = 0): string {
  const value = process.env[name] ?? '';
  if (isProd) {
    if (KNOWN_PLACEHOLDERS.has(value) || value.length < minLength) {
      throw new Error(
        `[config] ${name} is missing, a placeholder, or too short (min ${minLength}). Refusing to start in production.`
      );
    }
    return value;
  }
  return value || devFallback;
}

function list(name: string): string[] {
  return (process.env[name] ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export const config = {
  nodeEnv,
  isProd,
  /** Dev-only conveniences (pretty logs, permissive CORS) require NODE_ENV=development explicitly or unset outside prod. */
  isDev: !isProd,
  port: Number(process.env.PORT ?? 4000),
  host: process.env.HOST ?? (isProd ? '0.0.0.0' : '127.0.0.1'),
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtSecret: secret('JWT_SECRET', 'dev-only-insecure-secret', 32),
  paystackSecret: process.env.PAYSTACK_SECRET_KEY ?? '',
  /** Browser origins allowed to call the API. Empty in dev = localhost only. */
  corsOrigins: list('CORS_ORIGINS'),
  /**
   * Number of reverse-proxy hops in front of the API (Render/Fly/Nginx = 1).
   * Needed so rate limits key on the real client IP, not the proxy's.
   */
  trustProxyHops: Number(process.env.TRUST_PROXY_HOPS ?? 0),
  /** True once a real Postgres URL is set — routes fall back to in-memory shared data otherwise. */
  get hasDb() {
    return Boolean(this.databaseUrl);
  },
};
