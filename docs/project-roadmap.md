# Ewe ati Egbo — Project Roadmap (5 Phases)

Source: PRD §12. Sequenced supply-first: get the compliance-safe marketplace engine
live with real sellers before layering growth, knowledge and ecosystem features.

| Phase | Headline focus |
|-------|-----------------|
| 1 | Discovery & Design |
| 2 | Marketplace + Logistics MVP |
| 3 | Growth Layer |
| 4 | Botanical Knowledge System |
| 5 | Scale & Exit-readiness (wholesale, new corridors, data/rail licensing) |

## Phase 1 — Discovery & Design (current)

- [x] Market & competitor analysis (`market-analysis.md`)
- [x] UK regulatory classification + compliance engine design (`compliance.md`)
- [x] PRD v1.0 (`product-requirements.md`) + pitch (`pitch.md`)
- [x] Logistics network model (`logistics.md`)
- [x] Data model + initial schema (`data-model.md`, `supabase/migrations/`)
- [x] Screen-by-screen spec (`screens.md`)
- [x] Brand + go-to-market + risk register
- [ ] Confirm final commercial name
- [ ] Engage UK regulatory/customs adviser to sign off compliance + import scope
- [ ] Confirm Paystack (UK GBP collection / multi-currency) + platform legal entity (HMRC)
- [ ] Pick first corridor (e.g. Lagos→London); recruit first sellers + 1–2 cargo agents

## Phase 2 — Marketplace + Logistics MVP

- [ ] Scaffold `mobile/` Expo app (house pattern) + Supabase project
- [ ] Apply initial migration; RLS policies; seed categories/traditions/corridors
- [ ] Auth (Apple/Google/email/phone); customer onboarding (no health data)
- [ ] Discovery home + multilingual search (Postgres FTS + trigram)
- [ ] Product page + trust panel + **delivery quote**; store pages
- [ ] Seller onboarding + verification + fulfilment choice
- [ ] **Cargo-agent onboarding + verification + routes/rates**
- [ ] Structured product wizard (classes A–C; D gated)
- [ ] Compliance v1: manual review + hard blocks (claims + restricted list) + audit log
- [ ] Multi-seller cart → routing/quote → **Paystack split checkout** → order+shipments
- [ ] **Shipment tracking timeline**; payouts to seller + cargo-agent subaccounts
- [ ] Orders, reviews (verified purchase), wishlist, reports
- [ ] Admin: verification queues, moderation, compliance/import rules, routing, disputes
- [ ] Closed beta on one corridor: prove a real consolidated consignment end-to-end

## Phase 3 — Growth Layer

- [ ] Seller subscriptions + lower-commission tiers
- [ ] Featured listings, coupons, promotions
- [ ] Delivery-API integration (Royal Mail/Evri/DPD)
- [ ] Recommendations, seller analytics, referrals, loyalty
- [ ] Seller ↔ customer messaging, product bundles

## Phase 4 — Botanical Knowledge System

- [ ] Multilingual botanical database (sourced, reviewed traditional-use content)
- [ ] Product ↔ botanical rich linking; botanical detail pages
- [ ] Safety information surfacing (carefully sourced, non-medical)

## Phase 5 — Scale & Exit-readiness

- [ ] Wholesale / B2B ordering from verified suppliers
- [ ] New corridors (more African origins; then US/EU diaspora lanes)
- [ ] Automated least-cost routing + smart consolidation + carrier/customs APIs
- [ ] Data & logistics rail as licensable/acquirable assets (`pitch.md`)
