# Ewe ati Egbo — Leaves and Roots 🌿

**The cross-border commerce & logistics rail for African botanicals into the UK.**

Ewe ati Egbo (Yoruba: *"leaves and roots"*) is a verified marketplace **and freight
network** that moves traditional herbal, botanical and natural-wellness products from
African producers and diaspora sellers to customers in the United Kingdom. Sellers
list; customers buy; our own cargo arm and a network of onboarded cargo agents move
the goods Africa→UK and to the door.

Two marketplaces in one, and the second is the moat:

1. **Products** — verified sellers (African producers + UK diaspora shops), structured
   botanical listings, multilingual vernacular search, hard UK-compliance boundaries.
2. **Logistics** — our in-house Africa→UK cargo, plus third-party cargo agents we
   onboard, rate, and route orders through. This is the defensible asset: anyone can
   copy a storefront; a working cross-border freight network for a fragmented,
   culturally-specific supply chain is hard to copy and expensive to rebuild.

Payments run through **Paystack** (split across seller, cargo agent, and platform via
subaccounts).

> ⚠️ **Not an online pharmacy.** UK herbal products span foods/supplements (FSA),
> cosmetics (OPSS) and medicines (MHRA), and importing them adds food-import/border
> rules. The platform is designed so sellers **cannot** market a product as a cure,
> and so cross-border compliance is handled for them. See [docs/compliance.md](docs/compliance.md).

## Documentation

- 🎯 The pitch (why someone buys this): [docs/pitch.md](docs/pitch.md)
- 📖 Source of truth: [docs/product-requirements.md](docs/product-requirements.md) — PRD v1.0
- 🔎 Market, competitors & regulatory classification: [docs/market-analysis.md](docs/market-analysis.md)
- 🚚 Logistics network (the moat): [docs/logistics.md](docs/logistics.md)
- 🌿 Botanical catalogue (agbo/ewe/egbo, categorised): [docs/herbs-catalog.md](docs/herbs-catalog.md)
- ⚖️ Compliance & claims engine: [docs/compliance.md](docs/compliance.md)
- 🎨 Brand system: [docs/brand-guidelines.md](docs/brand-guidelines.md) — Deep Green `#1F6B3B` · Earth Ochre `#C6862B`
- 🧱 Technical architecture: [docs/technical-architecture.md](docs/technical-architecture.md)
- 🗄️ Data model: [docs/data-model.md](docs/data-model.md)
- 📱 Screen-by-screen spec: [docs/screens.md](docs/screens.md)
- 📈 Go-to-market & economics: [docs/go-to-market.md](docs/go-to-market.md)
- ⚠️ Risk register: [docs/risk-register.md](docs/risk-register.md)
- 🗺️ Build plan: [docs/project-roadmap.md](docs/project-roadmap.md) · current focus: [TODO.md](TODO.md)

## Project phases

| Phase | Scope | Progress |
|---|---|---|
| **1. Discovery & Design** | PRD, market/regulatory analysis, logistics model, brand, data model, compliance — this doc set | `████████░░` ~80% |
| **2. Marketplace + Logistics MVP** | Expo app + Supabase: buy-side, seller onboarding/listing, cargo-agent onboarding/routing, Paystack split, admin | `█░░░░░░░░░` ~10% |
| **3. Growth Layer** | Seller subscriptions, featured listings, promotions, richer routing/tracking, analytics | `░░░░░░░░░░` 0% |
| **4. Botanical Knowledge System** | Multilingual botanical database, product↔botanical linking, sourced content | `░░░░░░░░░░` 0% |
| **5. Scale & Exit-readiness** | Wholesale/B2B, more corridors (US/EU diaspora), data & logistics as licensable assets | `░░░░░░░░░░` 0% |

## Four sides of the marketplace

| Actor | Gets |
|---|---|
| **Customer** (UK) | Discovery, multilingual search, trusted product pages, multi-seller cart, cross-border delivery quote + tracking, orders, reviews |
| **Seller** (Africa or UK) | Onboarding + verification, storefront, structured product wizard, orders, payouts, choice of fulfilment (our cargo / own) |
| **Cargo agent** | Onboarding, route & rate setup, consignment queue, tracking updates, payouts for legs carried |
| **Admin** | Verification, product/claims moderation, compliance + import rules, routing oversight, orders, disputes, reports |

## Architecture — monorepo (npm workspaces)

Rebuilt on the Carpadi pattern: a shared package of **types + tested logic + the
botanical dataset**, consumed by an **owned Fastify/Postgres backend** and the Expo
app. Portable and not vendor-locked — the right shape for a business you intend to sell.

```
Ewe ati Egbo/
├── shared/     @eweatiegbo/shared — domain types, pure logic (search, compliance,
│               routing), and the botanical dictionary (docs/herbs-catalog.md).
│               Unit-tested; built to dist/ and imported by backend + mobile.
├── backend/    @eweatiegbo/backend — Fastify + pg (+ redis/queues later). Catalog,
│               search, compliance-check and health APIs; db/schema.sql + db/seed.
├── mobile/     Expo SDK 54 · expo-router — customer app (demo mode via mockData);
│               being pointed at @eweatiegbo/shared next.
├── supabase/   original SQL migration (full commerce/logistics schema, porting into
│               backend table-by-table).
└── docs/       PRD, pitch, market, logistics, compliance, data-model, herbs, screens…
```

```bash
npm install                 # root — installs shared + backend workspaces
npm run shared:build        # compile the shared package
npm run shared:test         # 7 logic tests (search + compliance)
npm run backend             # Fastify API on :4000 (demo mode without DATABASE_URL)
npm run mobile              # Expo app

# live proof (backend running):
curl localhost:4000/health
curl "localhost:4000/api/herbs?q=onugbu"          # Igbo → resolves Bitter leaf
curl -X POST localhost:4000/api/compliance/check \
  -H 'content-type: application/json' \
  -d '{"text":"cures malaria","productClass":"A"}' # → {"decision":"blocked"}
```

The botanical dictionary + restricted-ingredient list seed from
[`shared/src/data/herbs.ts`](shared/src/data/herbs.ts) (46 herbs, 8 categories, each
carrying a 🟢/🟠/🔴 compliance flag). Full commerce/logistics schema (sellers, cargo
agents, corridors, shipments, Paystack payouts, orders) lives in
[`supabase/migrations/`](supabase/migrations) and is being ported into `backend/db`.

---

*Ewe ati Egbo — leaves and roots, moved with trust.*
