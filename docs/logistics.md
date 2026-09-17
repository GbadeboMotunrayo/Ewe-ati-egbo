# Ewe ati Egbo — Logistics Network (The Moat)

Source: PRD §6.3, §9; `pitch.md`. This is the asset a buyer actually wants. Anyone can
clone a storefront; a working Africa→UK freight rail for a fragmented, low-trust,
compliance-heavy supply chain is hard, slow and expensive to rebuild.

## 1. The model

We operate **our own cargo arm** and **onboard third-party cargo agents**, then route
each order over the best corridor by cost and ETA. We are the network operator; agents
are supply.

```
African sellers ──┐
                  ├─▶ Consolidation point (origin hub) ─▶ Cargo leg (agent/own) ─▶ UK hub ─▶ UK last-mile ─▶ Customer
UK sellers ───────┘ (self-ship or UK hub)                         │
                                                          customs / import clearance
```

## 2. Entities

| Entity | What it is |
|---|---|
| **Corridor** | An origin→destination lane (e.g. Lagos → London, Accra → London) |
| **Cargo agent** | A verified carrier (our own arm is agent #0) that serves one or more corridors at published rates + capacity |
| **Route** | A cargo agent's offer on a corridor: price model, transit time, handling terms |
| **Consignment** | A batch a cargo agent carries — may consolidate items from many sellers/orders on the same corridor |
| **Shipment** | The customer-facing unit: the items from an order travelling together, with a status timeline |

An **order** fans out into **shipments**; shipments are grouped into **consignments**
for the cargo leg; a consignment is carried by one **cargo agent** over one **corridor**.

## 3. Fulfilment routes (per product/order)

1. **Platform cargo (Africa-origin)** — seller drops at origin hub → we consolidate →
   agent/own carries to UK → clear customs → UK last-mile. *Default for Africa sellers.*
2. **Cargo-agent (third party)** — same shape, leg carried by an onboarded agent we
   route to and pay.
3. **UK direct (self-ship)** — UK-based seller ships domestically via Royal Mail/Evri/
   DPD; no cross-border leg.

Seller sets which routes their product supports; platform picks/【asks】at checkout.

## 4. Delivery quote at checkout (must-have UX)

Before paying, the customer sees: **corridor, carrier, price, ETA window**, plus any
import handling. Never surprise them with cost or a month-long wait after they've
committed. Quote = origin handling + cargo-leg rate (from the chosen route) + customs/
duty estimate + UK last-mile.

## 5. Consolidation (where margin comes from)

Many small parcels from many small sellers on one corridor → consolidate into one
consignment → per-unit cost drops → we keep the spread. Consolidation efficiency is a
direct function of volume and is a core reason the moat compounds.

## 6. Cargo-agent onboarding & rating

- Verification: identity/business, corridor proof, handling/insurance declarations,
  Paystack subaccount.
- Each agent publishes routes (corridor + rate model + transit time + capacity).
- Agents are **rated** on on-time %, damage/loss rate, exception handling → routing
  prefers better agents; poor agents get less flow or suspended.

## 7. Customs, import & compliance (surfaced simply, handled by us)

Cross-border adds a layer on top of `compliance.md`:
- **Food/botanical import** (Class A/B) — FSA/border food-import requirements; some
  plant material carries plant-health/phytosanitary conditions.
- **Cosmetics** (Class C) — must meet UK cosmetics rules on entry.
- **Medicines** (Class D) — medicine import controls; closed by default.
- **Duty & VAT** — estimated in the quote; the platform (as the import orchestrator)
  ensures declarations are correct.

> The value proposition *is* that the seller and customer don't have to understand any
> of this. Get the rules encoded per class/corridor; confirm specifics with a UK
> customs/regulatory adviser before a corridor goes live. Design input, not legal advice.

## 8. Tracking

Every shipment has a status timeline: `created → at_origin_hub → in_transit →
customs → at_uk_hub → out_for_delivery → delivered` (+ `exception`). Cargo agents (and
our arm) push updates; customer and seller see the same timeline.

## 9. Economics (see `go-to-market.md` §2)

Two platform revenue lines per order: **product commission** + **logistics margin**
(markup on freight and consolidation spread), plus a **platform fee on legs routed to
third-party agents**. Logistics is a profit centre we own, not a cost we pass through.

## 10. MVP vs later

- **MVP:** corridors + cargo agents + routes as data; manual routing (admin assigns
  agent) is acceptable; shipment status timeline; delivery quote from route rates;
  split payout to agent via Paystack.
- **Later:** automated least-cost routing, smart consolidation batching, carrier/customs
  API integrations, live tracking feeds, capacity forecasting, more corridors.
