import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  HERBS,
  HERB_CATEGORY_LABELS,
  searchHerbs,
  evaluateListing,
  type HerbCategory,
} from '@eweatiegbo/shared';

const CATEGORY_IDS = Object.keys(HERB_CATEGORY_LABELS) as [HerbCategory, ...HerbCategory[]];

// Catalog + botanical-dictionary API. Backed by the shared dataset in demo mode;
// swap to Postgres queries once db:seed has run.
export async function catalogRoutes(app: FastifyInstance) {
  app.get('/categories', async () => ({
    categories: Object.entries(HERB_CATEGORY_LABELS).map(([id, label]) => ({
      id,
      label,
      count: HERBS.filter((h) => h.category === (id as HerbCategory)).length,
    })),
  }));

  const searchSchema = z.object({
    q: z.string().trim().max(100).optional(),
    category: z.enum(CATEGORY_IDS).optional(),
  });
  app.get('/herbs', async (req) => {
    const { q, category } = searchSchema.parse(req.query);
    let results = q ? searchHerbs(q, HERBS) : HERBS;
    if (category) results = results.filter((h) => h.category === category);
    return { count: results.length, herbs: results };
  });

  const idSchema = z.object({ id: z.string().max(64) });
  app.get('/herbs/:id', async (req, reply) => {
    const { id } = idSchema.parse(req.params);
    const herb = HERBS.find((h) => h.id === id);
    if (!herb) return reply.code(404).send({ error: 'not_found' });
    return herb;
  });

  // Pre-publish compliance check a seller UI can call live (docs/compliance.md §4).
  // Advisory only — the publish path must re-run evaluateListing server-side.
  const checkSchema = z.object({
    text: z.string().min(1).max(10_000),
    productClass: z.enum(['A', 'B', 'C', 'D']),
    herbId: z.string().max(64).optional(),
  });
  app.post('/compliance/check', { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } }, async (req, reply) => {
    const { text, productClass, herbId } = checkSchema.parse(req.body);
    const herb = herbId ? HERBS.find((h) => h.id === herbId) : undefined;
    if (herbId && !herb) return reply.code(400).send({ error: 'unknown_herb', herbId });
    return evaluateListing({ text, productClass, herb, dictionary: HERBS });
  });
}
