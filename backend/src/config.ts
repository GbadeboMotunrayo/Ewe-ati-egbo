import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret',
  paystackSecret: process.env.PAYSTACK_SECRET_KEY ?? '',
  isDev: process.env.NODE_ENV !== 'production',
  /** True once a real Postgres URL is set — routes fall back to in-memory shared data otherwise. */
  get hasDb() {
    return Boolean(this.databaseUrl);
  },
};
