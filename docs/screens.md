# Ewe ati Egbo — Screen-by-Screen Spec

Source: PRD §6, §8. The "redesign" ask: onboarding → discovery → product → checkout,
plus seller and admin. Not a pharmacy look — a premium botanical marketplace.

## Screen map

```
                          EWE ATI EGBO
                               │
   ┌──────────────┬────────────┼────────────┬──────────────┐
CUSTOMER        SELLER      CARGO AGENT     ADMIN
   │              │             │             │
Home           Dashboard    Dashboard     Verification queues
Explore        Verification Verification  Product/claims moderation
Search         Storefront   Routes/rates  Compliance + import rules
Category       Add product  Consignments  Routing oversight
Product        Products     Shipments     Orders
Store          Fulfilment   Tracking      Disputes
Cart           Orders       Payouts       Reports
Checkout       Payouts
Orders+track   Analytics
Wishlist
Account
```

---

## Customer

### C1 · Onboarding (minimal, no health questions)
1. **Continue with** Apple / Google / Email / Phone.
2. **Your interests** (optional, skippable): 🌿 herbs · 🍵 teas · 🧴 skincare ·
   🌱 botanicals · 🥗 foods · 💆 wellbeing.
3. **Your location** (optional): UK postcode — for delivery estimate & local sellers.
4. → Home. *Never* ask condition/medication/"what are you trying to cure."

### C2 · Home (discovery)
- Search bar: *"Search herbs, botanicals, products…"*
- **Shop by category:** Herbs · Teas · Botanicals · Supplements · Natural beauty ·
  Oils · Roots & barks.
- **Shop by tradition:** West African · East African · Caribbean · South Asian ·
  Middle Eastern · Chinese.
- Rails: Trending botanicals · New sellers · Popular near you · Recently added ·
  Traditional favourites.

### C3 · Search (the moat)
- Types `bitter leaf`, `ewuro`, `onugbu`, or `Vernonia amygdalina` → same results.
- Vernacular label shown on the result ("Ewuro · Bitter leaf · *Vernonia amygdalina*").
- Filters: category, tradition, price, seller verification level, in stock.

### C4 · Category / tradition listing
- Grid of product cards: image, title, vernacular name, price, seller name +
  verification badge, rating.

### C5 · Product page (the trust page)
```
ORGANIC PREKESE
Tetrapleura tetraptera            ★ 4.8 (127)
£12.99 · 100 g · In stock
Sold by 🌿 Adom Botanicals  ✓ Verified Seller

About this botanical  · origin · plant part · form
What you're buying    · net qty · packed in UK · packaging
How to use            · seller's approved directions (claim-checked)
Safety & storage      · structured warnings, allergens
```
**Trust panel** (only shows checks actually performed — no decorative ticks):
| Check | Status |
|---|---|
| Seller identity | ✓ Verified |
| Product category | ✓ Classified (A/B/C/D) |
| Ingredients provided | ✓ |
| Batch / expiry info | ✓ |
| Regulatory documentation | ✓ / — |
| Claims review | ✓ Passed |

**Delivery quote** (before add-to-basket): shows corridor + carrier + price + ETA
window, e.g. *"Lagos → London · 5–9 days · £12"* or *"UK direct · 2–4 days · £3.99"*.
Never surprise cost/ETA after commitment.

Actions: Add to basket · Buy now · Wishlist · **Report product**.
Below: seller profile card · reviews · shipping · returns.

### C6 · Store (seller mini-shop)
Header (name, verification badge, location, bio, rating, order count) · tabs:
Shop · About · Reviews · Policies · Contact.

### C7 · Cart (multi-seller)
Grouped by seller; each group shows its shipping cost/estimate **before** checkout.
One "Proceed to checkout".

### C8 · Checkout
Address · **delivery per shipment/corridor** (route, carrier, ETA, cost) · payment
(**Paystack**) · summary with product + delivery breakdown + duty/VAT estimate + total.
Pre-purchase disclosure: price, delivery cost/ETA, returns, seller identity.

### C9 · Orders + tracking
List → order detail broken into **shipments**, each with a status timeline:
`created → at origin hub → in transit → customs → at UK hub → out for delivery →
delivered` (+ exception). Shows corridor + carrier per shipment. "Report problem".

### C10 · Wishlist / C11 · Account
Wishlist grid. Account: profile, addresses, payment methods, preferences, support.

---

## Seller

### S1 · Onboarding (adaptive)
1. Account (name, email, phone, password; individual/business).
2. Business profile (business/trading name, UK address, contact, website/socials,
   type, years operating).
3. **Identity verification:** ID, proof of address, business registration + tax info
   where required, payout (Stripe Connect) — required (HMRC reporting + trust).
4. **Product class** (A herb/botanical · B supplement · C cosmetic · D medicine).
   This changes the product wizard's required fields (see `compliance.md` §2).
5. → Dashboard; await `verified`.

### S2 · Dashboard
Today's sales · orders · products · pending · rating. `+ Add product`. Nav: Orders ·
Products · Customers · Payouts · Analytics · Storefront · Verification · Support.

### S3 · Add product (structured wizard, not a blank form)
- **Identity:** title, common name, botanical name, origin, country of manufacture.
- **Classification:** product type, form, **intended use from a controlled list**
  (culinary / traditional use / general wellbeing / cosmetic) — no free-text cures.
- **Information:** ingredients, plant part, preparation, net qty, directions, storage,
  allergens, warnings, batch/lot, expiry, certification.
- **Media:** images (optimised on upload).
- On submit → claims scan + ingredient traffic-light → publish / review / block,
  with the reason shown to the seller if blocked.

On the product/order, seller picks **fulfilment**: *our cargo network* (drop at origin
hub) or *self-ship* (UK direct). This sets which routes the item supports.

### S4 · Products · S5 · Orders · S6 · Payouts · S7 · Analytics · S8 · Storefront editor
Standard marketplace-seller screens; payouts (Paystack subaccount) net of commission.

---

## Cargo agent

### G1 · Onboarding & verification
Identity/business, corridor proof, insurance/handling declaration, Paystack subaccount.
Our own arm is agent #0 (pre-verified).

### G2 · Dashboard
Active consignments · shipments awaiting pickup · on-time rating · payouts.

### G3 · Routes & rates
Define offers per corridor: rate model (per-kg/per-parcel/flat), price, transit
window, capacity. Toggle active.

### G4 · Consignments & shipments
Queue of shipments routed to this agent on its corridors; group into consignments;
accept / seal / mark in-transit / cleared / delivered.

### G5 · Tracking updates
Push status changes on each shipment (customer + seller see the same timeline).

### G6 · Payouts
Per-leg earnings via Paystack subaccount, net of platform leg fee.

---

## Admin

### A1 · Verification queues
Seller **and cargo-agent** applications, documents, approve/reject →
`verified`/`trusted`/`suspended`.

### A1b · Routing oversight
See which agent/corridor each shipment is on; reassign, handle exceptions, watch
on-time and delivered-cost per corridor.

### A2 · Product & claims moderation
Pending / flagged listings; AI-flagged claims with the detected phrase; approve /
reject / suspend. Every action writes `audit_logs`.

### A3 · Compliance rules
Manage `restricted_ingredients` (green/amber/red); view audit trail; recalls.

### A4 · Orders · A5 · Disputes · A6 · Reports
Operational dashboards: GMV, orders, commission, refunds, disputes, reported items.

---

## Design intent
Premium botanical marketplace — warm, earthy, trustworthy. Generous imagery,
clear structured information, honest trust signals. See `brand-guidelines.md`.
