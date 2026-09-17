# Ewe ati Egbo — Product Requirements Document (v1.0)

Status: **Draft for review.** Source of truth. Sibling docs (`pitch`,
`market-analysis`, `logistics`, `compliance`, `technical-architecture`, `data-model`,
`screens`, `go-to-market`, `roadmap`, `risk-register`) expand individual sections.

Framing: this is a **venture built to scale and be acquired** — a cross-border
commerce + logistics rail, not a single shop's app. See `pitch.md`.

---

## 1. Product vision

A trusted marketplace **and freight network** that moves traditional botanicals, herbs
and natural-wellness products from African producers and UK diaspora sellers to UK
customers — with verified sellers, structured botanical info, multilingual search,
Paystack split payments, and a cargo-agent logistics network that we own and route.

**Positioning:** *The trusted cross-border rail for African botanicals into the UK —
verified sellers, honest labels, and logistics that actually work.*

## 2. Problem

UK diaspora customers buy traditional herbs through an untrusted, unstructured patchwork
(WhatsApp, IG, Etsy, suitcase importers). The genuinely hard, unsolved part is
**getting product from Africa to the UK reliably, legally and affordably**. Whoever owns
that rail owns the category (`pitch.md`).

## 3. Target users

| Segment | Who | Core need |
|---|---|---|
| **UK customers** | African/Caribbean diaspora first; later wellness-curious UK shoppers | Authentic, correctly-named products, trusted, delivered |
| **African sellers/producers** | Farms, processors, exporters, market traders | Reach UK demand without solving logistics/compliance themselves |
| **UK diaspora sellers** | Specialist shops, importers | A trusted storefront + reach + optional fulfilment |
| **Cargo agents** | Our own arm + third-party Africa→UK freight/consolidators | Order flow, routing, payouts for legs carried |
| **Admin/compliance** | Us | Keep the marketplace legal, trusted, and the rail moving |

## 4. Product principles (enforced in code)

1. **Own the rail.** Logistics is a first-class product surface and profit centre, not
   an afterthought (`logistics.md`).
2. **Trust is the product.** Every listing answers: who sells it, where it's from,
   what's in it, form, quantity, storage, warnings, and whether it's legal to sell &
   import in that class.
3. **The platform decides regulatory class — not free text.** Sellers pick a product
   class; the system sets required fields and the allowed claim vocabulary. No "cures"
   in a food listing (`compliance.md`).
4. **Handle cross-border for the seller.** Import/food-safety/customs complexity is
   the platform's job, surfaced simply.
5. **No fake green ticks; seller verification ≠ product approval.**
6. **Don't collect health data.** Ask what you're shopping for, never your conditions.
7. **Privacy-first.** No PII in URLs; decline non-essential cookies by default.

## 5. Product classes (drives fields, claims, regulatory + import route)

| Class | Examples | UK route | Import note | Claims |
|---|---|---|---|---|
| **A — Herbs & botanicals** | Bitter leaf, prekese, moringa, roots, barks | Food/general (FSA) | Food-import + possible plant-health rules | Culinary + neutral "traditional use" only |
| **B — Food supplements** | Capsules, powders, tinctures, blends | Food supplement (FSA) | Food-import rules | Permitted nutrition wording; **no disease claims** |
| **C — Cosmetics & personal care** | Black soap, oils, hair/skin products | Cosmetics (OPSS) | Cosmetics safety + product info | Cosmetic function only |
| **D — Herbal medicines** | Products marketed to treat illness | MHRA THR/MA | Medicine import controls | Only what THR/MA permits — **gated, closed by default at MVP** |

## 6. Core features (MVP scope in §13)

### 6.1 Customer
- Auth (Apple/Google/email/phone), optional interests + UK postcode.
- Discovery: shop by category, by origin/tradition, trending, new sellers.
- **Multilingual search** (vernacular↔botanical↔Latin).
- Trusted product page + trust panel; **cross-border delivery quote shown before
  checkout** (which cargo route, cost, ETA).
- Multi-seller cart → single Paystack checkout → split order → per-shipment tracking.
- Orders, reviews (verified purchase), wishlist, reports.

### 6.2 Seller
- Onboarding + verification (`compliance.md` §5); Paystack subaccount for payouts.
- Storefront, structured product wizard (classes A–C; D gated), inventory.
- Fulfilment choice per product/order: **our cargo network** or **self-ship**.
- Orders, payouts, basic analytics.

### 6.3 Cargo agent (new pillar)
- Onboarding + verification; define **routes** (origin→UK corridors), **rates**, and
  capacity; Paystack subaccount.
- Consignment queue: orders/consolidations routed to them; accept, update status,
  mark delivered; payouts per leg.

### 6.4 Admin
- Verification queues (sellers + cargo agents).
- Product/claims moderation; compliance + **import rules**; restricted-ingredient list.
- Routing oversight (which agent, which corridor, exceptions).
- Orders, refunds, disputes, reports, recalls, audit log.

## 7. Seller & cargo-agent verification

States `pending → verified → trusted → suspended`. Collected: identity, business
registration, address, tax info (platform reporting), Paystack subaccount. Cargo agents
additionally: corridor/route proof, insurance/handling declarations. Seller
verification ≠ product approval; never imply "MHRA approved."

## 8. Journeys (full flows in `screens.md`)

- **Customer:** discover → product (with delivery quote) → multi-seller cart →
  Paystack checkout → order split into shipments → track each → receive → review.
- **Seller:** onboard → verify → list (wizard) → choose fulfilment → receive order →
  hand to cargo/self-ship → get paid out.
- **Cargo agent:** onboard → verify → set routes/rates → receive consignment → update
  tracking → deliver → get paid per leg.

## 9. Marketplace + logistics mechanics

- **Multi-seller cart, one Paystack payment, split via subaccounts** across seller(s),
  cargo agent(s), and platform.
- **Order → shipments.** An order fans out into per-seller items and per-corridor
  shipments; a shipment may consolidate items from multiple sellers on the same route.
- **Routing.** At checkout the platform picks/asks the cargo route (own arm or agent)
  by corridor, cost and ETA; customer sees the quote before paying.
- **Commission + logistics margin.** Product commission (8–12%) **and** logistics margin
  are both platform revenue (`go-to-market.md`).

## 10. Payments — Paystack

- Collection + **split payments via subaccounts** (seller / cargo agent / platform).
- Payouts to seller & agent subaccounts; refunds; disputes.
- ⚠️ Due-diligence flag: Paystack settles to merchant accounts in supported African
  countries and currencies; UK GBP collection + multi-currency settlement must be
  confirmed, and the operating legal entity chosen accordingly (`risk-register.md`).

## 11. Reviews, reports, safety

Verified-purchase reviews (product, packaging, accuracy, delivery, seller). Reports on
product/seller/order/shipment. Fake-review controls (DMCC Act 2024). Recalls handled by
admin. Detail in `compliance.md`.

## 12. AI layer (flags, never decides)

Detects medicinal claims and blocks publish; classifies products; identifies botanical
names; detects duplicates/missing fields; drafts SEO copy from approved facts; moderates
reviews. Humans + rules engine decide; every block is audit-logged.

## 13. MVP vs later

**MVP (Phase 2) — the rail, thin but end-to-end:**
- Customer: register, browse, multilingual search, product page + delivery quote, cart,
  Paystack checkout, orders + shipment tracking, reviews.
- Seller: register, verification, storefront, product wizard (A–C; D gated), orders,
  fulfilment choice, payouts.
- Cargo agent: register, verification, routes/rates, consignment queue, tracking, payouts.
- Admin: verification, moderation, compliance rules v1, routing oversight, orders,
  disputes, reports.
- Payments: Paystack split. Compliance: manual review + hard blocks on red/medical claims.

**Phase 3:** subscriptions, featured listings, promotions, smarter routing/consolidation,
analytics, messaging, bundles.
**Phase 4:** multilingual botanical knowledge system + sourced content.
**Phase 5:** wholesale/B2B, new corridors (US/EU diaspora), data/logistics as licensable
assets, exit-readiness.

## 14. Non-goals (for now)

Online pharmacy; health-condition profiling; self-built payment rails; unrestricted
Class D; building our own last-mile courier where Royal Mail/Evri/DPD suffice.

## 15. Success metrics

GMV, orders, product take + logistics margin, verified sellers, active cargo agents &
corridors, on-time delivery rate, delivered-cost per parcel, repeat-purchase rate,
% listings auto-flagged, dispute rate, review coverage.

## 16. Open questions

- Operating legal entity + jurisdiction (drives Paystack + platform reporting).
- First corridor(s) (e.g. Lagos→London) and first cargo agent(s).
- Confirm Paystack UK GBP collection / multi-currency, else hybrid provider.
- Sourcing mix: how much Africa-origin vs UK-based-seller at launch.
- Final commercial name (Ewe ati Egbo is the working name).
