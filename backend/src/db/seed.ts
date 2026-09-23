import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { HERBS } from '@eweatiegbo/shared';
import { config } from '../config';
import { pool } from './client';

// Seeds the botanical dictionary + restricted-ingredient list from the shared
// dataset. Run: `npm run db:seed --workspace=backend` (needs DATABASE_URL).
// All-or-nothing: runs in one transaction, so a failure never leaves a half-seeded DB.
async function seed() {
  if (!config.hasDb || !pool) {
    console.error('No DATABASE_URL set — nothing to seed. See backend/.env.example.');
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    await client.query('begin');
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schema);

    for (const h of HERBS) {
      await client.query(
        `insert into botanicals
           (id, yoruba, other_names, english, botanical, part, category, traditional_use, platform_class, regulatory_flag, note)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         on conflict (id) do update set
           yoruba=excluded.yoruba, other_names=excluded.other_names, english=excluded.english,
           botanical=excluded.botanical, part=excluded.part, category=excluded.category,
           traditional_use=excluded.traditional_use, platform_class=excluded.platform_class,
           regulatory_flag=excluded.regulatory_flag, note=excluded.note`,
        [h.id, h.yoruba, h.otherNames, h.english, h.botanical, h.part, h.category, h.traditionalUse, h.platformClass, h.regulatoryFlag, h.note ?? null]
      );
    }

    // Rebuild the restricted list from the dictionary so a herb downgraded to
    // green never keeps a stale amber/red row.
    await client.query('delete from restricted_ingredients');
    for (const h of HERBS.filter((x) => x.regulatoryFlag !== 'green')) {
      await client.query(
        `insert into restricted_ingredients (id, botanical_id, status, note) values ($1,$1,$2,$3)`,
        [h.id, h.regulatoryFlag, h.note ?? null]
      );
    }

    await client.query('commit');
    const restricted = HERBS.filter((h) => h.regulatoryFlag !== 'green').length;
    console.log(`Seeded ${HERBS.length} botanicals (${restricted} flagged amber/red).`);
  } catch (err) {
    await client.query('rollback');
    console.error('Seed failed — rolled back, database unchanged.', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

void seed();
