import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { HERBS } from '@eweatiegbo/shared';
import { config } from '../config';
import { pool } from './client';

// Seeds the botanical dictionary + restricted-ingredient list from the shared
// dataset. Run: `npm run db:seed --workspace=backend` (needs DATABASE_URL).
async function seed() {
  if (!config.hasDb || !pool) {
    console.error('No DATABASE_URL set — nothing to seed. See backend/.env.example.');
    process.exit(1);
  }

  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);

  for (const h of HERBS) {
    await pool.query(
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

    if (h.regulatoryFlag !== 'green') {
      await pool.query(
        `insert into restricted_ingredients (id, botanical_id, status, note)
         values ($1,$1,$2,$3)
         on conflict (id) do update set status=excluded.status, note=excluded.note`,
        [h.id, h.regulatoryFlag, h.note ?? null]
      );
    }
  }

  const restricted = HERBS.filter((h) => h.regulatoryFlag !== 'green').length;
  console.log(`Seeded ${HERBS.length} botanicals (${restricted} flagged amber/red).`);
  await pool.end();
}

void seed();
