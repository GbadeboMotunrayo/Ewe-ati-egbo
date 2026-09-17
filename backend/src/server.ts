import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { config } from './config';
import { healthRoutes } from './routes/health';
import { catalogRoutes } from './routes/catalog';

export function buildServer() {
  const app = Fastify({
    logger: config.isDev ? { transport: { target: 'pino-pretty' } } : true,
  });

  app.register(helmet);
  app.register(cors, { origin: true });
  app.register(rateLimit, { max: 200, timeWindow: '1 minute' });

  app.register(healthRoutes);
  app.register(catalogRoutes, { prefix: '/api' });

  return app;
}

async function main() {
  const app = buildServer();
  try {
    await app.listen({ port: config.port, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// Run only when executed directly (not when imported by tests).
if (require.main === module) {
  void main();
}
