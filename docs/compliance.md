# Ewe ati Egbo — Compliance & Claims Engine

Source: PRD §5, §7, §11. This is the platform's **moat** and its biggest legal risk,
so it is specified as an actual engine, not a policy page. Backed by the data model
(`data-model.md`: `products.product_class`, `products.regulatory_class`,
`product_claims`, `restricted_ingredients`, `audit_logs`).

> Working understanding for product design only. A UK-qualified regulatory adviser
> must sign this off before launch. See `market-analysis.md` §5.

## 1. The core rule

The **platform** assigns regulatory class and controls allowed claims. A seller
**cannot** free-type a medical promise into a food/cosmetic listing and publish it.
Claims are regulated as much as products.

## 2. Product classes → what changes

| Class | Onboarding/wizard adds | Claims vocabulary | Publish path |
|---|---|---|---|
| **A — Herb/botanical** | Botanical name, plant part, origin, form, net qty, storage, allergens, warnings | Culinary + neutral "traditional use" descriptors | Auto-publish if claims clean + ingredients green |
| **B — Food supplement** | + ingredient breakdown, directions, dosage, batch, best-before | Only permitted nutrition/health wording; **no disease claims** | Auto-publish if clean; else review |
| **C — Cosmetic** | + safety-assessment reference, product info file, ingredient (INCI) list | Cosmetic function only | Review before first publish |
| **D — Herbal medicine** | + **THR / MA number + evidence upload** | Only what THR/MA permits | **Admin approval mandatory; closed by default at MVP** |

## 3. Restricted-ingredient list (traffic-light engine)

Every product's ingredients are checked against a maintained list.

| Status | Meaning | Action |
|---|---|---|
| 🟢 **Green** | No known UK restriction for this use | May be listed |
| 🟠 **Amber** | Restricted / conditional (dose, form, part, evidence) | Requires additional documentation + admin review |
| 🔴 **Red** | Banned/prohibited or medicine-only | **Cannot be listed** — hard block |

Source data: MHRA restricted/banned herbal ingredient lists + registered herbal
medicines list, curated into `restricted_ingredients` and reviewed on a cadence.

## 4. Claims engine

Each product carries a `claim_type` and `claim_status`. Seller free-text (title,
description, directions) is scanned before publish.

```
seller submits listing
        │
        ▼
  AI claims scan  ──▶ detects medicinal/health claims, banned phrases
        │
        ├─ clean  ──────────────▶ ingredient check (traffic light)
        │                              ├─ all green ──▶ class rule ──▶ publish / queue
        │                              ├─ any amber ──▶ admin review
        │                              └─ any red   ──▶ BLOCKED
        └─ claim detected ──────▶ BLOCKED pending human review
                                   (never auto-published)
```

Worked examples (mirrors the data model):

```
Product: Bitter Leaf Powder
  class: A (food/botanical) · claim_type: traditional_use · medical_claims: none
  ingredients: 🟢 green · status: APPROVED

Product: "Herbal Prostate Cure"
  detected claim: "treats prostate disease" (medicinal)
  status: BLOCKED · reason logged to audit_logs · seller notified with the offending text
```

AI **flags**; a human + the rules engine **decide**. Every block writes an
`audit_logs` row (what, why, which rule, who/what triggered it) so decisions are
defensible.

## 4a. Cross-border import layer (new)

Because product moves Africa→UK, each class carries an **import rule** on top of its
domestic rule, applied per corridor (see `logistics.md` §7):

| Class | Import layer |
|---|---|
| A — herb/botanical (food) | FSA food-import requirements; some plant material carries plant-health/phytosanitary conditions |
| B — supplement | Food-import requirements |
| C — cosmetic | Must meet UK cosmetics rules on entry |
| D — medicine | Medicine import controls — closed by default |

Duty & VAT are estimated in the checkout delivery quote; the platform, as import
orchestrator, ensures declarations are correct. The value proposition is that sellers
and customers never have to understand this. Encode rules per (class × corridor) and
confirm with a UK customs/regulatory adviser before a corridor goes live.

## 5. Seller & cargo-agent verification, HMRC reporting

Mandatory verification (`pending → verified → trusted`) exists partly because UK
**digital-platform reporting rules** require the marketplace to collect, verify and
report seller identity + income to HMRC. Collected: legal name, business type &
registration (if any), UK address, tax info where required, bank/payout details.

- **Seller verification ≠ product approval.** Displayed separately. Never imply
  "MHRA approved seller."
- Only show a trust check when it was actually performed (no decorative green ticks).

## 6. Reviews & consumer law

- Verified-purchase-only reviews; fake-review detection (DMCC Act 2024).
- Pre-purchase disclosure: price, delivery cost/options, returns, seller identity
  (Consumer Rights Act / Consumer Contracts Regs).

## 7. Product safety, recalls & reporting

- Report taxonomy on every product/seller/order includes: incorrect information,
  suspected counterfeit, safety concern, prohibited product, medical claim,
  misleading description, seller issue.
- Admin can suspend a product/seller and issue a recall; recalls notify affected
  buyers.

## 8. Data-privacy stance

- No health-condition/medication data collected from customers.
- No personal/sensitive data in URLs or query strings.
- Decline non-essential cookies by default.
- Seller documents stored access-controlled; RLS default-deny (see
  `technical-architecture.md`).

## 9. What ships when

- **MVP (Phase 2):** classes A–C live; D gated/closed; restricted list v1;
  AI claims flag + hard block on red/medical claims; mandatory seller verification;
  audit log.
- **Later:** richer amber-review workflows, automated recall notifications,
  periodic re-verification, expanded restricted list per tradition.
