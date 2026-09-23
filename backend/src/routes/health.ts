import type { FastifyInstance } from 'fastify';
import { HERB_COUNT } from '@eweatiegbo/shared';
import { config } from '../config';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({
    status: 'ok',
    // Infra detail only outside production.
    ...(config.isProd ? {} : { db: config.hasDb ? 'configured' : 'in-memory (demo)', herbs: HERB_COUNT }),
    time: new Date().toISOString(),
  }));
}
