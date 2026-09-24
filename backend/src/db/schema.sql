-- Backend botanical-dictionary schema (the seed target).
-- The full commerce/logistics schema lives in ../../supabase/migrations and is
-- being ported here table-by-table as the owned Fastify+pg backend replaces
-- Supabase-direct access (see docs/technical-architecture.md).

create extension if not exists pg_trgm;

create table if not exists botanicals (
  id            text primary key,
  yoruba        text not null,
  other_names   text[] not null default '{}',
  english       text,
  botanical     text,
  part          text,
  category      text not null,
  traditional_use text,          -- ethnobotanical reference only; never a sales claim
  platform_class char(1) not null check (platform_class in ('A','B','C','D')),
  regulatory_flag text not null check (regulatory_flag in ('green','amber','red')),
  note          text
);

-- Fuzzy multilingual name search across yoruba + english + botanical.
create index if not exists botanicals_search_trgm
  on botanicals using gin ((coalesce(yoruba,'') || ' ' || coalesce(english,'') || ' ' || coalesce(botanical,'')) gin_trgm_ops);

-- The traffic-light engine reads this; rebuilt from the dictionary's flags on every seed.
create table if not exists restricted_ingredients (
  id            text primary key,
  botanical_id  text not null references botanicals(id) on delete cascade,
  status        text not null check (status in ('amber','red')),
  note          text
);
