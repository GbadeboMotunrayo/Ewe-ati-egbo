import { Pool } from 'pg';
import { config } from '../config';

// One shared pool. Guard usage with config.hasDb — routes fall back to the
// in-memory shared dataset when no DATABASE_URL is set (demo mode).
export const pool = config.hasDb ? new Pool({ connectionString: config.databaseUrl }) : null;

export async function query<T = unknown>(text: string, params?: unknown[]): Promise<T[]> {
  if (!pool) throw new Error('No database configured (set DATABASE_URL)');
  const res = await pool.query(text, params as never);
  return res.rows as T[];
}
