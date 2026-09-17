-- Ewe ati Egbo — initial schema
-- Matches docs/data-model.md. PostgreSQL (Supabase).
-- Marketplace for traditional botanicals with compliance built in.
-- RLS is enabled default-deny at the end; policies are added in Phase 2 technical design.

create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "pg_trgm";    -- fuzzy multilingual name search

-- ---------------------------------------------------------------------------
-- Identity
-- ---------------------------------------------------------------------------
create table users (
    id                uuid primary key default gen_random_uuid(),
    email             varchar(255) unique,
    phone             varchar(20) unique,
    name              varchar(255),
    role              varchar(20) not null default 'customer', -- customer | seller | admin
    postcode          varchar(12),
    interests         text[],
    created_at        timestamptz default now()
);

create table sellers (
    id                  uuid primary key default gen_random_uuid(),
    user_id             uuid references users(id) on delete cascade,
    business_name       varchar(255),
    trading_name        varchar(255),
    business_type       varchar(30),  -- individual | sole_trader | ltd | partnership | other
    uk_address          jsonb,
    contact             jsonb,
    years_operating     int,
    verification_status varchar(20) default 'pending', -- pending|verified|trusted|suspended
    tax_info            jsonb,        -- for HMRC digital-platform reporting
    payout_account_id   varchar(100), -- Stripe Connect account id
    created_at          timestamptz default now()
);

create table seller_documents (
    id            uuid primary key default gen_random_uuid(),
    seller_id     uuid references sellers(id) on delete cascade,
    doc_type      varchar(40),  -- id | proof_of_address | business_reg | other
    storage_path  text,
    status        varchar(20) default 'submitted', -- submitted|approved|rejected
    reviewed_by   uuid references users(id),
    created_at    timestamptz default now()
);

create table stores (
    id            uuid primary key default gen_random_uuid(),
    seller_id     uuid references sellers(id) on delete cascade unique,
    slug          varchar(120) unique,
    display_name  varchar(255),
    bio           text,
    location      varchar(120),
    logo_path     text,
    policies      jsonb,
    created_at    timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Taxonomy + botanical dictionary (the data moat)
-- ---------------------------------------------------------------------------
create table categories (
    id         uuid primary key default gen_random_uuid(),
    parent_id  uuid references categories(id),
    name       varchar(120),
    slug       varchar(120) unique
);

create table traditions (
    id    uuid primary key default gen_random_uuid(),
    name  varchar(120),
    slug  varchar(120) unique
);

create table botanicals (
    id                       uuid primary key default gen_random_uuid(),
    botanical_name           varchar(255),   -- Vernonia amygdalina
    common_name_en           varchar(255),   -- Bitter leaf
    plant_part               varchar(120),
    origin                   varchar(120),
    traditional_use          text,           -- Phase 4, sourced/reviewed
    safety_notes             text,
    default_regulatory_hint  varchar(20)      -- green|amber|red
);

create table botanical_names (
    id            uuid primary key default gen_random_uuid(),
    botanical_id  uuid references botanicals(id) on delete cascade,
    name          varchar(255),
    language      varchar(30),  -- yoruba|igbo|twi|ewe|hausa|akan|arabic|hindi|en
    kind          varchar(20) default 'vernacular' -- vernacular|synonym|spelling
);
create index botanical_names_name_trgm on botanical_names using gin (name gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- Products (class + regulatory + claims)
-- ---------------------------------------------------------------------------
create table products (
    id                      uuid primary key default gen_random_uuid(),
    seller_id               uuid references sellers(id) on delete cascade,
    store_id                uuid references stores(id),
    title                   varchar(255),
    product_class           char(1) not null,  -- A|B|C|D (compliance.md §2)
    regulatory_class        varchar(30),        -- food|supplement|cosmetic|medicine
    category_id             uuid references categories(id),
    tradition_id            uuid references traditions(id),
    form                    varchar(40),
    net_quantity            varchar(40),
    price_pence             int not null,
    description             text,
    directions              text,
    storage                 text,
    allergens               text,
    warnings                text,
    country_of_manufacture  varchar(120),
    status                  varchar(20) default 'draft', -- draft|pending|approved|rejected|suspended
    created_at              timestamptz default now()
);
create index products_title_trgm on products using gin (title gin_trgm_ops);

create table product_variants (
    id           uuid primary key default gen_random_uuid(),
    product_id   uuid references products(id) on delete cascade,
    label        varchar(80),
    price_pence  int,
    sku          varchar(80)
);

create table product_botanicals (
    product_id    uuid references products(id) on delete cascade,
    botanical_id  uuid references botanicals(id) on delete cascade,
    primary key (product_id, botanical_id)
);

create table product_claims (
    id             uuid primary key default gen_random_uuid(),
    product_id     uuid references products(id) on delete cascade,
    claim_type     varchar(30),  -- culinary|traditional_use|cosmetic|nutrition|none
    claim_status   varchar(20) default 'pending', -- pending|approved|blocked
    detected_text  text,
    reason         text
);

create table product_documents (
    id            uuid primary key default gen_random_uuid(),
    product_id    uuid references products(id) on delete cascade,
    doc_type      varchar(40),  -- thr_ma|safety_assessment|certificate|other
    storage_path  text,
    status        varchar(20) default 'submitted'
);

create table restricted_ingredients (
    id            uuid primary key default gen_random_uuid(),
    ingredient    varchar(255),
    botanical_id  uuid references botanicals(id),
    status        varchar(10) not null,  -- green|amber|red
    condition     text,
    source        text,
    updated_at    timestamptz default now()
);

create table inventory (
    variant_id  uuid references product_variants(id) on delete cascade primary key,
    quantity    int default 0
);

-- ---------------------------------------------------------------------------
-- Commerce (multi-seller order split)
-- ---------------------------------------------------------------------------
create table addresses (
    id           uuid primary key default gen_random_uuid(),
    customer_id  uuid references users(id) on delete cascade,
    line1        varchar(255),
    line2        varchar(255),
    city         varchar(120),
    postcode     varchar(12),
    is_default   boolean default false
);

create table orders (
    id           uuid primary key default gen_random_uuid(),
    customer_id  uuid references users(id),
    address_id   uuid references addresses(id),
    total_pence  int,
    status       varchar(20) default 'processing', -- processing|shipped|delivered|cancelled|refunded
    created_at   timestamptz default now()
);

create table order_items (
    id                 uuid primary key default gen_random_uuid(),
    order_id           uuid references orders(id) on delete cascade,
    seller_id          uuid references sellers(id),
    variant_id         uuid references product_variants(id),
    quantity           int,
    unit_price_pence   int,
    commission_pence   int,           -- platform take (10% at MVP)
    fulfilment_status  varchar(20) default 'processing',
    tracking           varchar(120)
);

create table payments (
    id            uuid primary key default gen_random_uuid(),
    order_id      uuid references orders(id) on delete cascade,
    provider      varchar(30) default 'stripe',
    provider_ref  varchar(120),
    amount_pence  int,
    status        varchar(20)  -- authorized|captured|refunded|failed
);

create table payouts (
    id            uuid primary key default gen_random_uuid(),
    seller_id     uuid references sellers(id),
    order_id      uuid references orders(id),
    amount_pence  int,          -- net of commission
    status        varchar(20) default 'pending',
    created_at    timestamptz default now()
);

create table shipping_options (
    id            uuid primary key default gen_random_uuid(),
    seller_id     uuid references sellers(id) on delete cascade,
    carrier       varchar(40),  -- royal_mail|evri|dpd|other (uk_direct self-ship)
    price_pence   int,
    est_min_days  int,
    est_max_days  int
);

-- ---------------------------------------------------------------------------
-- Logistics network (the moat) — see docs/logistics.md
-- ---------------------------------------------------------------------------
create table corridors (
    id              uuid primary key default gen_random_uuid(),
    origin_country  varchar(80),
    origin_hub      varchar(120),
    dest_country    varchar(80) default 'United Kingdom',
    dest_hub        varchar(120),
    slug            varchar(120) unique,  -- lagos-london
    active          boolean default true
);

create table cargo_agents (
    id                   uuid primary key default gen_random_uuid(),
    user_id              uuid references users(id),
    name                 varchar(255),
    is_platform_arm      boolean default false,  -- our own cargo = agent #0
    verification_status  varchar(20) default 'pending', -- pending|verified|trusted|suspended
    insurance_declared   boolean default false,
    payout_account_id    varchar(100),           -- Paystack subaccount
    rating               numeric(3,2),
    created_at           timestamptz default now()
);

create table routes (
    id                uuid primary key default gen_random_uuid(),
    cargo_agent_id    uuid references cargo_agents(id) on delete cascade,
    corridor_id       uuid references corridors(id),
    rate_model        varchar(20),  -- per_kg | per_parcel | flat
    rate_pence        int,
    per_kg_pence      int,
    transit_min_days  int,
    transit_max_days  int,
    capacity_note     text,
    active            boolean default true
);

create table consignments (
    id              uuid primary key default gen_random_uuid(),
    cargo_agent_id  uuid references cargo_agents(id),
    corridor_id     uuid references corridors(id),
    status          varchar(20) default 'open', -- open|sealed|in_transit|cleared|delivered
    created_at      timestamptz default now()
);

create table shipments (
    id                       uuid primary key default gen_random_uuid(),
    order_id                 uuid references orders(id) on delete cascade,
    corridor_id              uuid references corridors(id),
    route_id                 uuid references routes(id),
    cargo_agent_id           uuid references cargo_agents(id),
    consignment_id           uuid references consignments(id),
    fulfilment_type          varchar(20),  -- platform_cargo | agent | uk_direct
    price_pence              int,
    agent_cost_pence         int,
    duty_vat_estimate_pence  int,
    status                   varchar(20) default 'created',
        -- created|at_origin_hub|in_transit|customs|at_uk_hub|out_for_delivery|delivered|exception
    tracking_ref             varchar(120),
    created_at               timestamptz default now()
);

create table shipment_items (
    shipment_id    uuid references shipments(id) on delete cascade,
    order_item_id  uuid references order_items(id) on delete cascade,
    primary key (shipment_id, order_item_id)
);

-- ---------------------------------------------------------------------------
-- Trust: reviews, wishlist, reports, disputes, notifications, audit
-- ---------------------------------------------------------------------------
create table reviews (
    id             uuid primary key default gen_random_uuid(),
    order_item_id  uuid references order_items(id) unique,  -- verified purchase only
    customer_id    uuid references users(id),
    product_id     uuid references products(id),
    seller_id      uuid references sellers(id),
    rating         smallint check (rating between 1 and 5),
    quality        smallint,
    packaging      smallint,
    accuracy       smallint,
    delivery       smallint,
    body           text,
    created_at     timestamptz default now()
);

create table wishlists (
    customer_id  uuid references users(id) on delete cascade,
    product_id   uuid references products(id) on delete cascade,
    primary key (customer_id, product_id)
);

create table reports (
    id            uuid primary key default gen_random_uuid(),
    reporter_id   uuid references users(id),
    target_type   varchar(20),  -- product|seller|order
    target_id     uuid,
    reason        varchar(40),  -- medical_claim|safety|counterfeit|prohibited|misleading|other
    detail        text,
    status        varchar(20) default 'open',
    created_at    timestamptz default now()
);

create table disputes (
    id          uuid primary key default gen_random_uuid(),
    order_id    uuid references orders(id) on delete cascade,
    opened_by   uuid references users(id),
    reason      text,
    status      varchar(20) default 'open',
    created_at  timestamptz default now()
);

create table notifications (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid references users(id) on delete cascade,
    channel     varchar(10),  -- email|push|sms
    kind        varchar(40),
    payload     jsonb,
    read_at     timestamptz,
    created_at  timestamptz default now()
);

create table audit_logs (
    id           uuid primary key default gen_random_uuid(),
    actor        varchar(40),  -- 'ai' | user id | 'system'
    action       varchar(60),  -- claim_blocked|ingredient_red|seller_verified|...
    target_type  varchar(20),
    target_id    uuid,
    reason       text,
    rule_ref     text,
    created_at   timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Row-level security: default-deny. Policies added in Phase 2 technical design.
-- ---------------------------------------------------------------------------
alter table users                  enable row level security;
alter table sellers                enable row level security;
alter table seller_documents       enable row level security;
alter table stores                 enable row level security;
alter table categories             enable row level security;
alter table traditions             enable row level security;
alter table botanicals             enable row level security;
alter table botanical_names        enable row level security;
alter table products               enable row level security;
alter table product_variants       enable row level security;
alter table product_botanicals     enable row level security;
alter table product_claims         enable row level security;
alter table product_documents      enable row level security;
alter table restricted_ingredients enable row level security;
alter table inventory              enable row level security;
alter table addresses              enable row level security;
alter table orders                 enable row level security;
alter table order_items            enable row level security;
alter table payments               enable row level security;
alter table payouts                enable row level security;
alter table shipping_options       enable row level security;
alter table corridors              enable row level security;
alter table cargo_agents           enable row level security;
alter table routes                 enable row level security;
alter table consignments           enable row level security;
alter table shipments              enable row level security;
alter table shipment_items         enable row level security;
alter table reviews                enable row level security;
alter table wishlists              enable row level security;
alter table reports                enable row level security;
alter table disputes               enable row level security;
alter table notifications          enable row level security;
alter table audit_logs             enable row level security;
