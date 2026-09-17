# Ewe ati Egbo — Data Model (Core Entities)

Source: PRD §5–§11. Indicative at design stage — final field-level design (types,
indexes, constraints, RLS policies) is confirmed at Phase 2 technical design. Written
as PostgreSQL (Supabase). The initial migration in `../supabase/migrations/` matches
this document.

## Entity overview

| Entity | Purpose |
|--------|---------|
| `users` | Any actor — customer, seller, admin |
| `sellers` | Seller business profile + verification state |
| `seller_documents` | Uploaded ID / proof / registration for verification |
| `stores` | A seller's public storefront |
| `categories` | Product category tree (Herbs, Teas, Botanicals, Supplements, Beauty, Oils, Roots & barks) |
| `traditions` | Shop-by-tradition lanes (West African, Caribbean, South Asian…) |
| `botanicals` | The multilingual botanical dictionary (the data moat) |
| `botanical_names` | Vernacular/synonym names per botanical, per language |
| `products` | A listing, with product_class + regulatory_class + claims fields |
| `product_variants` | Size/form variants (100g, 250g, powder/whole) |
| `product_botanicals` | Product ↔ botanical link |
| `product_claims` | Declared claim_type + claim_status per product |
| `product_documents` | Certificates / THR-MA evidence / safety files |
| `restricted_ingredients` | Green/amber/red rules engine list |
| `inventory` | Stock per variant |
| `orders` | A customer's checkout (one payment) |
| `order_items` | Line items (each tied to a seller → enables split) |
| `payments` | Customer payment record (Stripe) |
| `payouts` | Per-seller payout after commission |
| `reviews` | Verified-purchase reviews |
| `wishlists` | Saved products |
| `addresses` | Customer delivery addresses |
| `corridors` | Origin→UK lanes (e.g. Lagos→London) |
| `cargo_agents` | Verified carriers (our arm = agent #0) with Paystack subaccount |
| `routes` | A cargo agent's rate/transit offer on a corridor |
| `shipments` | Customer-facing unit: items of an order travelling together, with status timeline |
| `shipment_items` | Order items assigned to a shipment |
| `consignments` | A cargo agent's carried batch consolidating shipments on one corridor |
| `shipping_options` | UK-direct carrier/cost/estimate (self-ship, non-corridor) |
| `reports` | Reports against products/sellers/orders/shipments |
| `disputes` | Order disputes |
| `notifications` | Email/push/SMS notifications |
| `audit_logs` | Every compliance block/decision + admin action |

## Indicative schema

```sql
-- users: any actor. role governs which app surfaces they see.
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    name VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'customer', -- customer | seller | admin
    postcode VARCHAR(12),          -- optional, for delivery/local
    interests TEXT[],              -- optional, e.g. {herbs,teas,skincare}
    created_at TIMESTAMPTZ DEFAULT now()
);

-- sellers: business profile + verification (see compliance.md §5)
CREATE TABLE sellers (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    business_name VARCHAR(255),
    trading_name VARCHAR(255),
    business_type VARCHAR(30),     -- individual | sole_trader | ltd | partnership | other
    uk_address JSONB,
    contact JSONB,                 -- phone, email, website, socials
    years_operating INT,
    verification_status VARCHAR(20) DEFAULT 'pending', -- pending|verified|trusted|suspended
    tax_info JSONB,                -- for HMRC digital-platform reporting
    payout_account_id VARCHAR(100),-- Stripe Connect account id
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE seller_documents (
    id UUID PRIMARY KEY,
    seller_id UUID REFERENCES sellers(id),
    doc_type VARCHAR(40),          -- id | proof_of_address | business_reg | other
    storage_path TEXT,             -- access-controlled bucket
    status VARCHAR(20) DEFAULT 'submitted', -- submitted|approved|rejected
    reviewed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE stores (
    id UUID PRIMARY KEY,
    seller_id UUID REFERENCES sellers(id) UNIQUE,
    slug VARCHAR(120) UNIQUE,
    display_name VARCHAR(255),
    bio TEXT,
    location VARCHAR(120),
    logo_path TEXT,
    policies JSONB,                -- shipping, returns, contact
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE categories (
    id UUID PRIMARY KEY,
    parent_id UUID REFERENCES categories(id),
    name VARCHAR(120),
    slug VARCHAR(120) UNIQUE
);

CREATE TABLE traditions (
    id UUID PRIMARY KEY,
    name VARCHAR(120),             -- West African, Caribbean, South Asian...
    slug VARCHAR(120) UNIQUE
);

-- botanicals: the multilingual data moat
CREATE TABLE botanicals (
    id UUID PRIMARY KEY,
    botanical_name VARCHAR(255),   -- e.g. Vernonia amygdalina
    common_name_en VARCHAR(255),   -- e.g. Bitter leaf
    plant_part VARCHAR(120),       -- leaf, root, bark, seed, fruit
    origin VARCHAR(120),
    traditional_use TEXT,          -- sourced/reviewed content (Phase 4)
    safety_notes TEXT,
    default_regulatory_hint VARCHAR(20) -- green|amber|red hint (compliance.md §3)
);

-- botanical_names: many vernacular names -> one botanical (drives search)
CREATE TABLE botanical_names (
    id UUID PRIMARY KEY,
    botanical_id UUID REFERENCES botanicals(id),
    name VARCHAR(255),
    language VARCHAR(30),          -- yoruba, igbo, twi, ewe, hausa, akan, arabic, hindi, en
    kind VARCHAR(20) DEFAULT 'vernacular' -- vernacular|synonym|spelling
);
-- index (name) trigram for fuzzy multilingual search

-- products: a listing. class drives required fields + allowed claims.
CREATE TABLE products (
    id UUID PRIMARY KEY,
    seller_id UUID REFERENCES sellers(id),
    store_id UUID REFERENCES stores(id),
    title VARCHAR(255),
    product_class CHAR(1) NOT NULL,     -- A|B|C|D  (see compliance.md §2)
    regulatory_class VARCHAR(30),       -- food|supplement|cosmetic|medicine
    category_id UUID REFERENCES categories(id),
    tradition_id UUID REFERENCES traditions(id),
    form VARCHAR(40),                   -- whole|cut|powder|extract|liquid|capsule...
    net_quantity VARCHAR(40),           -- "100 g"
    price_pence INT NOT NULL,
    description TEXT,
    directions TEXT,
    storage TEXT,
    allergens TEXT,
    warnings TEXT,
    country_of_manufacture VARCHAR(120),
    status VARCHAR(20) DEFAULT 'draft', -- draft|pending|approved|rejected|suspended
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE product_variants (
    id UUID PRIMARY KEY,
    product_id UUID REFERENCES products(id),
    label VARCHAR(80),                  -- "100g", "250g powder"
    price_pence INT,
    sku VARCHAR(80)
);

CREATE TABLE product_botanicals (
    product_id UUID REFERENCES products(id),
    botanical_id UUID REFERENCES botanicals(id),
    PRIMARY KEY (product_id, botanical_id)
);

CREATE TABLE product_claims (
    id UUID PRIMARY KEY,
    product_id UUID REFERENCES products(id),
    claim_type VARCHAR(30),             -- culinary|traditional_use|cosmetic|nutrition|none
    claim_status VARCHAR(20) DEFAULT 'pending', -- pending|approved|blocked
    detected_text TEXT,                 -- offending phrase if blocked
    reason TEXT
);

CREATE TABLE product_documents (
    id UUID PRIMARY KEY,
    product_id UUID REFERENCES products(id),
    doc_type VARCHAR(40),               -- thr_ma|safety_assessment|certificate|other
    storage_path TEXT,
    status VARCHAR(20) DEFAULT 'submitted'
);

-- restricted_ingredients: the traffic-light rules engine (compliance.md §3)
CREATE TABLE restricted_ingredients (
    id UUID PRIMARY KEY,
    ingredient VARCHAR(255),
    botanical_id UUID REFERENCES botanicals(id),
    status VARCHAR(10) NOT NULL,        -- green|amber|red
    condition TEXT,                     -- dose/part/form condition for amber
    source TEXT,                        -- reference
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE inventory (
    variant_id UUID REFERENCES product_variants(id) PRIMARY KEY,
    quantity INT DEFAULT 0
);

-- orders: one customer payment; items split by seller for fulfilment/payout
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    customer_id UUID REFERENCES users(id),
    address_id UUID REFERENCES addresses(id),
    total_pence INT,
    status VARCHAR(20) DEFAULT 'processing', -- processing|shipped|delivered|cancelled|refunded
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    seller_id UUID REFERENCES sellers(id),
    variant_id UUID REFERENCES product_variants(id),
    quantity INT,
    unit_price_pence INT,
    commission_pence INT,               -- platform take (10% at MVP)
    fulfilment_status VARCHAR(20) DEFAULT 'processing',
    tracking VARCHAR(120)
);

CREATE TABLE payments (
    id UUID PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    provider VARCHAR(30) DEFAULT 'stripe',
    provider_ref VARCHAR(120),
    amount_pence INT,
    status VARCHAR(20)                  -- authorized|captured|refunded|failed
);

CREATE TABLE payouts (
    id UUID PRIMARY KEY,
    seller_id UUID REFERENCES sellers(id),
    order_id UUID REFERENCES orders(id),
    amount_pence INT,                   -- net of commission
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE reviews (
    id UUID PRIMARY KEY,
    order_item_id UUID REFERENCES order_items(id) UNIQUE, -- verified purchase only
    customer_id UUID REFERENCES users(id),
    product_id UUID REFERENCES products(id),
    seller_id UUID REFERENCES sellers(id),
    rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
    quality SMALLINT, packaging SMALLINT, accuracy SMALLINT, delivery SMALLINT,
    body TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE wishlists (
    customer_id UUID REFERENCES users(id),
    product_id UUID REFERENCES products(id),
    PRIMARY KEY (customer_id, product_id)
);

CREATE TABLE addresses (
    id UUID PRIMARY KEY,
    customer_id UUID REFERENCES users(id),
    line1 VARCHAR(255), line2 VARCHAR(255),
    city VARCHAR(120), postcode VARCHAR(12),
    is_default BOOLEAN DEFAULT false
);

CREATE TABLE shipping_options (
    id UUID PRIMARY KEY,
    seller_id UUID REFERENCES sellers(id),
    carrier VARCHAR(40),                -- royal_mail|evri|dpd|other
    price_pence INT,
    est_min_days INT, est_max_days INT
);

CREATE TABLE reports (
    id UUID PRIMARY KEY,
    reporter_id UUID REFERENCES users(id),
    target_type VARCHAR(20),            -- product|seller|order
    target_id UUID,
    reason VARCHAR(40),                 -- medical_claim|safety|counterfeit|prohibited|misleading|other
    detail TEXT,
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE disputes (
    id UUID PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    opened_by UUID REFERENCES users(id),
    reason TEXT,
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    channel VARCHAR(10),                -- email|push|sms
    kind VARCHAR(40),
    payload JSONB,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- audit_logs: every compliance block/decision + admin action (compliance.md §4)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    actor VARCHAR(40),                  -- 'ai' | user id | 'system'
    action VARCHAR(60),                 -- claim_blocked|ingredient_red|seller_verified|...
    target_type VARCHAR(20),
    target_id UUID,
    reason TEXT,
    rule_ref TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

## Logistics entities (the moat — see `logistics.md`)

```sql
CREATE TABLE corridors (
    id UUID PRIMARY KEY,
    origin_country VARCHAR(80),   -- Nigeria, Ghana...
    origin_hub VARCHAR(120),      -- Lagos
    dest_country VARCHAR(80) DEFAULT 'United Kingdom',
    dest_hub VARCHAR(120),        -- London
    slug VARCHAR(120) UNIQUE,     -- lagos-london
    active BOOLEAN DEFAULT true
);

CREATE TABLE cargo_agents (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    name VARCHAR(255),
    is_platform_arm BOOLEAN DEFAULT false,   -- our own cargo = agent #0
    verification_status VARCHAR(20) DEFAULT 'pending', -- pending|verified|trusted|suspended
    insurance_declared BOOLEAN DEFAULT false,
    payout_account_id VARCHAR(100),          -- Paystack subaccount
    rating NUMERIC(3,2),                     -- on-time/damage-derived
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE routes (
    id UUID PRIMARY KEY,
    cargo_agent_id UUID REFERENCES cargo_agents(id),
    corridor_id UUID REFERENCES corridors(id),
    rate_model VARCHAR(20),        -- per_kg | per_parcel | flat
    rate_pence INT,                -- base in pence (GBP-equivalent)
    per_kg_pence INT,
    transit_min_days INT, transit_max_days INT,
    capacity_note TEXT,
    active BOOLEAN DEFAULT true
);

-- shipment: the customer-facing tracked unit
CREATE TABLE shipments (
    id UUID PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    corridor_id UUID REFERENCES corridors(id),
    route_id UUID REFERENCES routes(id),
    cargo_agent_id UUID REFERENCES cargo_agents(id),
    consignment_id UUID,           -- set when consolidated
    fulfilment_type VARCHAR(20),   -- platform_cargo | agent | uk_direct
    price_pence INT,               -- what customer paid for this shipment
    agent_cost_pence INT,          -- what we pay the agent (margin = price - cost - fees)
    duty_vat_estimate_pence INT,
    status VARCHAR(20) DEFAULT 'created', -- created|at_origin_hub|in_transit|customs|at_uk_hub|out_for_delivery|delivered|exception
    tracking_ref VARCHAR(120),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE shipment_items (
    shipment_id UUID REFERENCES shipments(id),
    order_item_id UUID REFERENCES order_items(id),
    PRIMARY KEY (shipment_id, order_item_id)
);

CREATE TABLE consignments (
    id UUID PRIMARY KEY,
    cargo_agent_id UUID REFERENCES cargo_agents(id),
    corridor_id UUID REFERENCES corridors(id),
    status VARCHAR(20) DEFAULT 'open', -- open|sealed|in_transit|cleared|delivered
    created_at TIMESTAMPTZ DEFAULT now()
);
```

Payout note: `sellers.payout_account_id` and `cargo_agents.payout_account_id` are
**Paystack subaccounts**; one order's payment splits across seller(s), cargo agent(s)
and the platform.

## Search design (the moat)

Customer types `bitter leaf` / `ewuro` / `onugbu` / `Vernonia amygdalina` →
all resolve via `botanical_names` (trigram/fuzzy) → `botanicals` → `product_botanicals`
→ live products. This vernacular-to-botanical mapping is the platform's proprietary
data advantage and compounds as sellers and traditions are added.

## Row-level security

Default-deny. Customers read published products and own orders/reviews/wishlist;
sellers read/write only their own store, products, orders, payouts; admins have
moderation scope. `seller_documents`, `product_documents`, `tax_info` are
access-controlled and never client-readable by other users.
