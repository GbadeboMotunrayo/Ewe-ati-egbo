# Ewe ati Egbo — Go-to-Market & Economics

Source: PRD §9, §10, §13; `pitch.md`, `logistics.md`.

## 1. Revenue lines

| Stream | Who pays | When | Notes |
|--------|----------|------|-------|
| **Product commission** | Seller | MVP | 8–12% of sale (start 10%) |
| **Logistics margin** | Built into delivery price | MVP | Markup on freight + consolidation spread — **the fat line** |
| **Cargo-agent platform fee** | Cargo agent | MVP | % of the leg value for orders we route to them |
| Seller subscriptions | Seller | Phase 3 | Free / Professional / Business tiers, lower commission |
| Featured listings | Seller | Phase 3 | Featured / Trending / New placements |
| Wholesale / B2B | UK retailers | Phase 5 | Bulk corridors from verified suppliers |
| Data / rail licensing | Partners | Phase 5 | Demand data; logistics rail as a licensable asset |

**Two takes per order (product + logistics)** is what makes the unit economics work.

## 2. Unit economics (illustrative — replace with real corridor numbers)

```
Order: £30 product + £12 delivery = £42 customer pays (via Paystack)
  Product commission (10%)                     = £3.00  → platform
  Delivery £12 = agent/own cost £8 + margin £4 = £4.00  → platform (logistics margin)
  Seller receives                              = £27.00 (product − commission)
  Cargo agent receives                         = £8.00  − platform leg fee
  Platform gross per order                     ≈ £7.00+ (product + logistics)
```
The delivery line, not the commission, is where a sustainable margin lives — and it's
defensible because we own the rail.

## 3. Payments — Paystack

- Collection + **split via subaccounts** (seller / cargo agent / platform) per order.
- Payouts to seller & agent subaccounts; refunds; disputes.
- ⚠️ Confirm Paystack UK GBP collection + multi-currency settlement and pick the
  operating legal entity accordingly (`risk-register.md`). If UK-side collection is
  constrained, evaluate a hybrid (Paystack Africa-side + a UK acquirer) — but design
  the money-split abstraction so the provider is swappable.

## 4. Go-to-market sequence

1. **Seed one corridor** (e.g. Lagos→London): recruit a handful of verified sellers +
   1–2 cargo agents (our arm is #0). Supply first — an empty marketplace dies.
2. **Prove the rail** with real consolidated consignments end-to-end (the make-or-break,
   `pitch.md`).
3. **Drive demand** into the populated corridor: diaspora WhatsApp/community channels,
   churches/mosques, cultural events, influencers, and **SEO on vernacular + botanical
   names** (our data is also an SEO moat).
4. **Add corridors** (Accra, Nairobi, Johannesburg origins) and expand UK demand.
5. **Replicate the rail** into US/EU diaspora corridors — same engine, new lanes.

## 5. Stakeholders

Sellers (African producers + UK diaspora shops), customers (UK diaspora → wellness-
curious), cargo agents (own + third party), Paystack, UK customs/regulatory adviser,
carriers for last-mile, and future acquirers (diaspora logistics/fintech, ethnic-foods
distributors, marketplace consolidators — see `pitch.md`).
