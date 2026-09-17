import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  HERBS,
  HERB_CATEGORY_LABELS,
  searchHerbs,
  evaluateListing,
  type HerbCategory,
} from '@eweatiegbo/shared';

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

  const searchSchema = z.object({ q: z.string().optional(), category: z.string().optional() });
  app.get('/herbs', async (req) => {
    const { q, category } = searchSchema.parse(req.query);
    let results = q ? searchHerbs(q, HERBS) : HERBS;
    if (category) results = results.filter((h) => h.category === category);
    return { count: results.length, herbs: results };
  });

  app.get<{ Params: { id: string } }>('/herbs/:id', async (req, reply) => {
    const herb = HERBS.find((h) => h.id === req.params.id);
    if (!herb) return reply.code(404).send({ error: 'not_found' });
    return herb;
  });

  // Pre-publish compliance check a seller UI can call live (docs/compliance.md §4).
  const checkSchema = z.object({
    text: z.string(),
    productClass: z.enum(['A', 'B', 'C', 'D']),
    herbId: z.string().optional(),
  });
  app.post('/compliance/check', async (req) => {
    const { text, productClass, herbId } = checkSchema.parse(req.body);
    const herb = herbId ? HERBS.find((h) => h.id === herbId) : undefined;
    return evaluateListing({ text, productClass, herb });
  });
}
