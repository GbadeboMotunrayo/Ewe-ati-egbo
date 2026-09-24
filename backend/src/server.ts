import Fastify, { type FastifyError } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { ZodError } from 'zod';
import { config } from './config';
import { healthRoutes } from './routes/health';
import { catalogRoutes } from './routes/catalog';

const LOCALHOST_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export function buildServer() {
  const app = Fastify({
    logger: config.isDev ? { transport: { target: 'pino-pretty' } } : true,
    // Real client IP behind N proxies (never `true` — that lets clients spoof X-Forwarded-For).
    trustProxy: config.trustProxyHops > 0 ? (_addr: string, hop: number) => hop < config.trustProxyHops : false,
    bodyLimit: 64 * 1024,
  });

  app.register(helmet);
  app.register(cors, {
    origin: (origin, cb) => {
      // Non-browser clients (mobile app, curl) send no Origin header.
      if (!origin) return cb(null, true);
      if (config.corsOrigins.includes(origin)) return cb(null, true);
      if (config.isDev && LOCALHOST_ORIGIN.test(origin)) return cb(null, true);
      return cb(null, false);
    },
    methods: ['GET', 'POST'],
  });
  app.register(rateLimit, { max: 200, timeWindow: '1 minute', keyGenerator: (req) => req.ip });

  // Bad input is the client's fault (400) and never leaks schemas or stack traces.
  app.setErrorHandler((err: FastifyError | ZodError, req, reply) => {
    if (err instanceof ZodError) {
      return reply.code(400).send({
        error: 'invalid_request',
        issues: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      });
    }
    const status = (err as FastifyError).statusCode ?? 500;
    if (status < 500) return reply.code(status).send({ error: (err as FastifyError).code ?? 'bad_request', message: err.message });
    req.log.error(err);
    return reply.code(500).send({ error: 'internal_error' });
  });

  app.register(healthRoutes);
  app.register(catalogRoutes, { prefix: '/api' });

  return app;
}

async function main() {
  const app = buildServer();
  try {
    await app.listen({ port: config.port, host: config.host });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// Run only when executed directly (not when imported by tests).
if (require.main === module) {
  void main();
}
