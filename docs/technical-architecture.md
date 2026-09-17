# Ewe ati Egbo — Technical Architecture

Source of truth: `product-requirements.md`. This expands the PRD into something an
engineering team can build against in Phase 2. Choices are indicative — confirm at
Phase 2 technical design.

> **Build (rebuilt 2026-09-17, Carpadi monorepo pattern).** npm-workspaces monorepo:
> a shared `@eweatiegbo/shared` package (domain **types + pure, unit-tested logic** +
> the **botanical dictionary**) is consumed by an **owned Fastify + Postgres backend**
> and the Expo app. This supersedes Supabase-direct access from earlier drafts —
> owning the API keeps the compliance/routing/search logic in one tested place and
> keeps the business portable (not vendor-locked), which matters for a venture built
> to be acquired. Postgres remains the store; Supabase can still host it. The shared
> package proves out today with 7 passing logic tests and a live catalog/compliance
> API (see README).

## 1. System layers

| # | Layer | Responsibility |
|---|-------|-----------------|
| 1 | Client | Expo app (Android/iOS/web): customer, seller and admin surfaces |
| 2 | API / Edge | Supabase (PostgREST + Edge Functions) for business logic that can't live in the client |
| 3 | Data | PostgreSQL (Supabase) — see `data-model.md`; object storage for images/documents |
| 4 | Search | Full-text + trigram in Postgres at MVP; Meilisearch/Algolia if scale needs it |
| 5 | Payments | Paystack — collection + split via subaccounts (seller / cargo agent / platform), payouts, refunds, disputes |
| 6 | Logistics | Corridors, cargo agents, routes, shipments/consignments, routing + tracking (Edge Functions) |
| 7 | Compliance | Claims-scan + restricted-ingredient rules + per-corridor import rules (Edge Functions), audit log |
| 8 | Notifications | Email + push (+ SMS/WhatsApp later) |

Money-movement is behind a small `payments` abstraction so the provider (Paystack) is
swappable if UK GBP collection needs a hybrid acquirer (`go-to-market.md` §3).

## 2. Data flow (checkout, simplified)

```
Customer cart (multi-seller)
        │
        ▼
  Routing: per item pick corridor + route (own arm / agent) → delivery quote
        │
        ▼
  Checkout → single Paystack transaction (product + delivery), split config
        │
        ▼
  Order → order_items per seller → shipments per corridor (consolidatable)
        │
        ├──▶ Seller payout (product − commission)
        ├──▶ Cargo-agent payout (leg − platform fee)
        └──▶ Platform (commission + logistics margin)
        │
        ▼
  Shipment status timeline pushed by cargo agent / own arm → customer + seller
```

## 3. Compliance flow (publish, simplified)

```
Seller submits listing
        │
        ▼
  Edge fn: claims scan  ──▶ medicinal/health claim? ──▶ BLOCK + audit_log
        │ clean
        ▼
  Edge fn: ingredient check vs restricted_ingredients
        ├─ red   ──▶ BLOCK + audit_log
        ├─ amber ──▶ status=pending (admin review)
        └─ green ──▶ class rule (A/B auto-publish, C/D review) 
```

## 4. Core technology choices (indicative)

| Layer | Choice | Why |
|-------|--------|-----|
| App | Expo SDK 54 · TypeScript · expo-router | House standard; one codebase Android + iOS + web |
| Backend | Supabase (Postgres, Auth, Storage, Edge Functions) | House standard; RLS, fast to MVP, matches `../Amona`, `../karin` |
| Auth | Supabase Auth (Apple, Google, email, phone OTP) | Native providers, phone-first works for target users |
| Payments | Paystack (split payments via subaccounts) | Diaspora/Africa-side settlement, split across seller/agent/platform — don't build money movement; keep provider swappable |
| Logistics/routing | Supabase tables + Edge Functions (manual routing at MVP) | Corridors/agents/routes/shipments; automated least-cost routing later |
| Search | Postgres FTS + `pg_trgm` (MVP) → Meilisearch (later) | Multilingual vernacular matching without early infra cost |
| Storage | Supabase Storage buckets | Product images (public), seller/product docs (private, access-controlled) |
| Compliance engine | Supabase Edge Functions + rules tables | Server-side so it can't be bypassed by the client |
| AI moderation | Claude API via an Edge Function | Claim detection, classification, dedupe, SEO copy from approved facts |
| Notifications | Expo push + transactional email (Resend/Postmark) | Order + verification + moderation events |

## 5. App surfaces (one Expo codebase, role-gated)

- **Customer** — home/discovery, explore/search, product (with delivery quote), store,
  cart, checkout, orders + shipment tracking, wishlist, account.
- **Seller** — dashboard, verification, storefront, add/manage products (wizard),
  fulfilment choice, orders, payouts, analytics.
- **Cargo agent** — dashboard, verification, routes/rates, consignment/shipment queue,
  status updates, payouts.
- **Admin** — verification queues, product/claims moderation, compliance + import
  rules, routing oversight, orders, disputes, reports. (May start web-only.)

Role comes from `users.role` (+ `cargo_agents`/`sellers` membership); RLS enforces data
boundaries regardless of UI. Stripe references elsewhere are superseded by Paystack.

## 6. Environments & config

- `mobile/.env.example` → Supabase URL + anon key, Paystack public key.
- Secrets (Paystack secret, Claude API key) live only in Edge Function config, never
  in the client.
- Demo mode: a fresh clone runs against `src/data/mockData.ts` (house convention from
  `../Amona`) so the app renders without live keys.

## 7. Non-functional targets (confirm Phase 2)

- Low-data, lean app (target-market phones); image optimisation on upload.
- Default-deny RLS; private buckets for documents.
- No PII in URLs; decline non-essential cookies (web).
- Auditability: every compliance decision is logged.
