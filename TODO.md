# Ewe ati Egbo — TODO

Current focus: **Phase 1 → 2 transition.** Full roadmap: `docs/project-roadmap.md`.

## Phase 1 — Discovery & Design (done)

- [x] Pitch / exit thesis (`docs/pitch.md`)
- [x] Market & competitor analysis + sizing (`docs/market-analysis.md`)
- [x] Logistics network model — the moat (`docs/logistics.md`)
- [x] UK regulatory + import classification + compliance engine (`docs/compliance.md`)
- [x] PRD v1.0 (`docs/product-requirements.md`)
- [x] Data model + initial schema incl. logistics (`docs/data-model.md`, `supabase/migrations/`)
- [x] Screen spec incl. cargo-agent surfaces + tracking (`docs/screens.md`)
- [x] Brand, go-to-market (Paystack + logistics economics), roadmap, risk register
- [ ] Confirm final commercial name
- [ ] Engage UK regulatory/customs adviser (MHRA/FSA/OPSS/HMRC + import per corridor)
- [ ] Confirm Paystack UK GBP/multi-currency + operating legal entity
- [ ] Pick first corridor (e.g. Lagos→London); recruit first sellers + 1–2 cargo agents

## Phase 2 — Marketplace + Logistics MVP (in progress)

Rebuilt 2026-09-17 as a Carpadi-style monorepo (`shared` + `backend` + `mobile`).

- [x] Monorepo wiring (npm workspaces, tsconfig.base) mirroring Carpadi
- [x] `shared/` — types + botanical dictionary (46 herbs, 8 categories, compliance flags)
- [x] `shared/` logic — multilingual search + compliance engine; 7 unit tests passing
- [x] `backend/` — Fastify + pg skeleton; catalog/search/compliance/health APIs live
- [x] Botanical catalogue doc (`docs/herbs-catalog.md`) + seed (`backend/db/seed.ts`)
- [~] `mobile/` Expo customer app runs (demo) — **point it at `@eweatiegbo/shared` next**
- [ ] Port full commerce/logistics schema from `supabase/migrations/` into `backend/db`
- [ ] Seller, **cargo-agent** and admin surfaces per `docs/screens.md`
- [ ] Routing + delivery quote; shipment tracking timeline
- [ ] Paystack split checkout; payouts to seller + agent subaccounts
- [ ] Compliance v1 wired into publish flow (backend enforce + audit log)
- [ ] Expand the botanical dictionary (more herbs + Igbo/Hausa/Twi/Arabic/Hindi names)

## Docs index

- `docs/pitch.md` — the case for building/buying this
- `docs/product-requirements.md` — PRD v1.0 (source of truth)
- `docs/market-analysis.md`
- `docs/logistics.md` — the moat
- `docs/herbs-catalog.md` — botanical catalogue (mirrors `shared/src/data/herbs.ts`)
- `docs/compliance.md`
- `docs/technical-architecture.md`
- `docs/data-model.md`
- `docs/screens.md`
- `docs/brand-guidelines.md`
- `docs/go-to-market.md`
- `docs/project-roadmap.md`
- `docs/risk-register.md`
