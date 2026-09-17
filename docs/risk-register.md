# Ewe ati Egbo — Risk Register

Source: PRD §13, §15. Owners/status are placeholders — assign at Phase 2 kickoff and
review at the end of every phase.

| # | Risk | Impact | Mitigation | Owner | Status |
|---|------|--------|------------|-------|--------|
| 1 | A seller lists a product with illegal medicinal claims | Legal / reputational | Claims engine blocks on detection; class-D closed by default; human review; audit log | TBD | Open |
| 2 | A banned/restricted ingredient gets listed | Legal / safety | Green/amber/red rules engine; red = hard block; periodic list review | TBD | Open |
| 3 | Platform mis-classifies its own legal operator status / HMRC reporting | Legal | Engage UK regulatory/legal adviser in Phase 1; mandatory seller identity+tax capture | TBD | Open |
| 4 | Empty marketplace — no supply when customers arrive | Growth / death | Supply-first GTM; seed one corridor with sellers + cargo agents before demand push | TBD | Open |
| 5 | Fake / incentivised reviews | Trust / legal (DMCC) | Verified-purchase-only reviews; fake-review detection | TBD | Open |
| 6 | Counterfeit or unsafe product reaches a buyer | Safety / trust | Verification, reports, admin suspend + recall workflow | TBD | Open |
| 7 | Payment/split/payout errors or disputes | Financial / trust | Use Paystack subaccounts (don't build money movement); provider-swappable abstraction; dispute workflow | TBD | Open |
| 7a | Paystack can't cleanly collect GBP in the UK / multi-currency | Financial / go-live blocker | Confirm in Phase 1; pick operating entity accordingly; hybrid acquirer fallback behind the `payments` abstraction | TBD | Open |
| 7b | The Africa→UK rail doesn't actually work at viable cost/time | **Existential** | De-risk first: prove one real consolidated consignment end-to-end before scaling (`pitch.md` #3) | TBD | Open |
| 7c | Cross-border import/customs non-compliance (food/plant health) | Legal / seizure | Encode rules per class×corridor; UK customs adviser sign-off per corridor before go-live (`logistics.md` §7) | TBD | Open |
| 7d | Cargo agent fails / loses/damages goods | Trust / cost | Verification + insurance declaration; agent rating drives routing; suspend poor agents | TBD | Open |
| 8 | Over-collecting sensitive data (e.g. health) | Legal / privacy | Never ask health conditions; no PII in URLs; private buckets; RLS default-deny | TBD | Open |
| 9 | Seller verification too slow → seller churn | Supply | Clear SLA; document checklist up front; staged verified→trusted | TBD | Open |
| 10 | AI claim-scan false negatives/positives | Compliance / seller UX | AI flags, humans decide; show reason to seller; tune against real listings | TBD | Open |

## Review cadence

Revisit at the end of every phase (`project-roadmap.md`). Add new risks as the
regulatory adviser and first sellers surface them in Phase 1–2.
