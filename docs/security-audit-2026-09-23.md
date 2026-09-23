# Ewe ati Egbo — Bug & Vulnerability Audit
*23 Sept 2026 · 10 parallel review agents · read-only (no source files changed)*

## The one-paragraph verdict
Nothing is exploitable **today**. There's no live auth, no payments, and Supabase has RLS switched on with zero policies, so everything is locked by default. The real danger is what the current *design* will turn into once Phase 2 is built. The schema, the cart and the compliance engine all trust the wrong party: the client, the seller or the cargo agent. Think of it as a house with strong locked doors and no walls drawn yet. Fix the blueprint now and it costs you an afternoon. Fix it after launch and it costs you money.

---

## 🔴 Critical / High: fix before any real user or payment

| # | Area | Issue | Where | Fix |
|---|---|---|---|---|
| 1 | Payments | **Paystack webhook retries can pay a seller twice.** `payments.provider_ref` isn't unique, and `payouts` doesn't link back to a payment. | migration L202-218 | `unique(provider, provider_ref)`, a `webhook_events(event_id unique)` table, `payouts.payment_id` plus a unique transfer ref |
| 2 | Payments | **The client sets the price.** The cart works out product and delivery totals on the phone, and nothing checks `orders.total_pence`. | `mobile/src/state/cart.tsx:45-66` | The server rebuilds the order from IDs, starts the Paystack transaction and generates the reference. Verify the HMAC-SHA512 signature, then call `/transaction/verify` |
| 3 | Payments | **Split-at-charge pays sellers and agents before delivery**, so refunds and chargebacks land on you. The schema can't record the agent's or the platform's share. | tech-architecture §2, migration `payouts` | Collect everything, pay out with Transfers after delivery plus a dispute window, and use a ledger table (seller/agent/platform legs that must sum to the payment) |
| 4 | Data | **Deleting an order silently wipes its payments, shipments and disputes** (`ON DELETE CASCADE`). | migration L192, 204, 277, 293, 335 | `ON DELETE RESTRICT` on money tables; cancel by status, never by delete |
| 5 | AuthZ | **Privilege columns sit in rows users can edit.** A normal "own-row update" policy would let a user set `role='admin'`, or let a seller mark themselves verified and swap in their own `payout_account_id`. | `users.role` L17, `sellers` L32-34, `cargo_agents` L246-250 | Column-level `GRANT UPDATE (safe cols)`; set role, verification and payout only through service_role or an admin RPC |
| 6 | AuthZ | `users.id` isn't linked to `auth.users`, so any future `auth.uid()` policy is unreliable. | migration L12-13 | FK to `auth.users`, plus a `handle_new_user` trigger that **never** copies role from metadata |
| 7 | Compliance | **Red (restricted) herbs publish if they're only named in the text.** A missing or unknown `herbId` is treated as green, and `productClass` comes from the client (label a Class D medicine "A" and it goes straight through). | `shared/src/logic/compliance.ts:65`, `catalog.ts:42` | Resolve herbs from the text on the server; unknown herb → review; class = max(client, herb.platformClass) |
| 8 | Compliance | **Claim scanner is easy to bypass.** Of ~110 adversarial inputs, all of these published: `cured`, `healing`, `gets rid of fever`, `boosts fertility`, `for high BP`, `antimalarial`, Cyrillic `сures`, zero-width chars, `cur3s`, `o n wo iba`, `for jedi jedi`, `💊 for 🦟`. | `compliance.ts:10-23` | Unicode normalise (NFKC, strip zero-width and diacritics, map look-alike letters) → stem patterns → synonym, condition and vernacular lists |
| 9 | Safety data | **Herb flags may be too permissive:** Ebolo (pyrrolizidine alkaloids) is green, Rere/coffee-senna seed (toxic) is only amber, Kola (caffeine) is green. | `shared/src/data/herbs.ts:26, 51, 59` | Ebolo → amber; split Rere seed out as red; Kola → amber with caffeine labelling. **Confirm with your UK regulatory adviser** |
| 10 | Deps | `fast-jwt` **CRITICAL**, `fastify`/`find-my-way` HIGH. | backend | `@fastify/jwt` is installed but **never imported**, so uninstall it (clears the critical). Plan the Fastify 4→5 upgrade |
| 11 | Mobile | **Session token is stored in plaintext** (AsyncStorage becomes localStorage on web). GitHub Pages shares one origin across all your repos, and Android backups include the token. | `supabaseClient.ts:18`, `app.config.js` | SecureStore-encrypted storage, `flowType:'pkce'`, `android.allowBackup:false`, custom domain for web |
| 12 | Mobile | **A production build silently falls back to demo mode** if env vars are missing. Users then see fake orders and a live-looking "Checkout with Paystack" button. | `supabaseClient.ts:9-17`, `orders.tsx`, `cart.tsx:68` | Throw on startup in non-dev builds unless `EXPO_PUBLIC_DEMO=1` |

## 🟠 Medium

- **Schema:** no CHECK constraints, so prices, quantities and inventory can go negative and commission can exceed 100%. No currency column, so NGN kobo in a "pence" column means a ~1500× error. `payments.provider` still defaults to **'stripe'**. Status and role fields accept any text. Foreign keys are nullable and unindexed. `orders.address_id` can point at another customer's address.
- **Backend:** invalid input returns **500 and leaks the zod schema**; there's no error handler (`catalog.ts:24,43`). Rate limit is one shared bucket behind a proxy (no `trustProxy`). If `NODE_ENV` is unset, the server runs as dev. `JWT_SECRET` falls back to `'dev-secret'`. CORS `origin:true` reflects any site. No max lengths on `q`, `text` or `category`.
- **Search:** `resolveHerb("kola")` returns **Bitter kola**, not Kola nut, and empty input returns Ewuro, so wrong herb means wrong compliance flag. Accented Yoruba (`ewúro`, `Ẹ̀wúrọ̀`) finds **nothing**. `"a"` matches all 46. Missing fields crash it. *Piper guineense* is listed twice.
- **Compliance false positives:** it hard-blocks `"sweet treats"`, `"pouch prevents spillage"`, and even the standard disclaimer `"Not intended to treat, cure or prevent any disease"`. A lone verb should route to review; strip disclaimers before scanning.
- **Trust UI:** `TrustPanel` shows a hard-coded **"Seller identity: Verified" ✓** even for pending or suspended sellers (`TrustPanel.tsx:11`). That breaks your own "no fake green ticks" rule.
- **Auth state race:** `getSession()` can overwrite a newer auth event, and with no `.catch` it can leave the spinner running forever (`auth.tsx:24`).
- **Seed:** there's no transaction, and a herb downgraded to green keeps its old restricted row (`seed.ts`).
- **Cargo-agent fraud:** agents "push" delivered status with no proof. Needs an append-only `shipment_events` table and customer OTP or carrier-verified delivery before payout.
- **.gitignore** misses `.env.production`, `*.pem`, `*.p8`, `*.jks` and `google-services.json`. Use `.env*` + `!.env.example`.
- **Fresh clone breaks the backend:** `shared/dist` is gitignored and there's no `prepare` build script.
- **UK GDPR:** a Nigerian entity holding UK customer data needs a transfer agreement (IDTA) and risk assessment, a UK representative, and data processing agreements with cargo agents.

## 🟡 Functional bugs (mobile)
1. Missing or unknown corridor → **£0 delivery** (`cart.tsx:52`, `DeliveryQuote.tsx:15`)
2. No way to decrease quantity or remove one item; `remove()` exists but isn't wired up (`cart.tsx:44`)
3. Back and close buttons do nothing after a deep link or web refresh (`[id].tsx:39`, `cart.tsx:33`); use `canGoBack() ? back() : replace('/')`
4. "Product not found" is a dead end; an array `id` param becomes `"p1,p2"`
5. App stays blank forever if fonts fail to load (`_layout.tsx:18`)
6. ErrorBoundary has no retry and shows the raw `error.message` in production
7. Mock order totals don't match the cart's own pricing (`mockData.ts:251, 268`)
8. Unknown product IDs kept in the cart → "empty" basket shows a £0 totals bar
9. Dead buttons: Shop Now, category tiles (no filter; "Beauty" doesn't match "Natural beauty"), tradition pills, Report product, account rows
10. Icon-only buttons have no accessibility labels; cart count isn't announced
11. Fixed 168px cards overflow on 320px phones; cart list key collides on `sellerName`
12. Signing out doesn't clear the cart

## ⚪ Low / housekeeping
- Web export has no CSP or referrer meta; `httpEquiv` is JSX spelling, so browsers ignore it
- Unsplash photos and Google Fonts are hotlinked (GDPR/PECR, and stock photos standing in for real products)
- Mockup shows fake GMV, App Store badges and seller names that could be real businesses; label it "illustrative" before using it in a pitch
- `pitch.md` states "we own the freight network / proven corridors" as fact; switch to future tense
- Root `npm run mobile` fails because mobile isn't a workspace; `eslint` isn't installed; no `engines` field
- Do **not** run `npm audit fix --force` in mobile: it *downgrades* expo-router. The mobile vulnerabilities are almost all build-time tooling

## ✅ Checked and clean
No secrets in the repo or git history. Regexes aren't vulnerable to ReDoS (1 MB in 12 ms). No prototype pollution on `/herbs/:id`. Helmet is active. No source maps in dist. The 404.html has no open redirect. Marketing copy has no health claims. Mock listings pass the compliance scanner.

---

## Fix-first list (in order)
1. `npm uninstall @fastify/jwt -w backend`, add a Fastify error handler, and fail on startup if secrets are missing in production *(about 30 min)*
2. Migration v2: order/payment `RESTRICT`, unique `provider_ref`, CHECK constraints, currency column, `users`→`auth.users` FK, column-level grants on privileged fields
3. Compliance v2: server-side herb resolution from text, class = max(client, herb), Unicode normalisation, tiered review/block, plus regression tests for every bypass above
4. Payments design: server-priced orders, verified and idempotent webhooks, collect-then-transfer with holdback
5. Correct the Ebolo, Rere and Kola flags (with your adviser), and fix the hard-coded "Verified" tick

---

## Fix status (branch `fix/security-and-design`)

| # | Item | Status |
|---|---|---|
| 1 | Duplicate Paystack webhooks | ✅ `unique(provider, provider_ref)`, `webhook_events` idempotency table, payout legs tied to payment |
| 2 | Client-set prices | ⚠️ Partly — DB guards price columns; cart labelled estimate-only. **Server-side order pricing + Paystack verify still to build** |
| 3 | Split pays before delivery | ⏳ **Decision needed** (collect-then-transfer recommended). Schema now supports seller/agent/platform legs; payouts can't exceed payment |
| 4 | Order delete wipes payments | ✅ `ON DELETE RESTRICT` on all money/dispute tables |
| 5 | Privilege columns editable | ✅ Column grants + guard triggers (role, verification, payout account, prices, product status) |
| 6 | `users` not linked to auth | ✅ FK to `auth.users`, signup trigger never copies role |
| 7 | Red herb in text / class downgrade | ✅ Herbs detected in text; class = max(declared, herb); unknown herb → review |
| 8 | Claim-scanner bypasses | ✅ Normalisation, stems, synonyms, Yoruba/Pidgin/Igbo, emoji, misspellings; 74 regression tests |
| 9 | Herb safety flags | ✅ Ebolo→amber, Rere→red, Kola→amber — **pending UK regulatory adviser** |
| 10 | Critical/high deps | ✅ `@fastify/jwt` removed, Fastify 4→5; backend `npm audit`: 0 vulnerabilities |
| 11 | Plaintext session token | ✅ Keychain/Keystore (chunked SecureStore) on native, sessionStorage on web, PKCE, `allowBackup:false` |
| 12 | Silent demo fallback | ✅ Production build without keys shows maintenance screen unless `EXPO_PUBLIC_DEMO=1` |
| — | Backend 500s / CORS / rate limit / secrets | ✅ Error handler (400s), origin allowlist, `TRUST_PROXY_HOPS`, prod refuses weak `JWT_SECRET` |
| — | Mobile functional bugs (12) | ✅ All fixed (quantity controls, £0 delivery, back nav, fonts, error retry, fake orders, dead buttons, a11y labels…) |
| — | Shipment proof / audit log | ✅ `shipment_events` + delivered-needs-evidence trigger; append-only, hash-chained audit log |
| — | UK GDPR paperwork | ⏳ Non-code: IDTA + TRA, UK Art. 27 representative, DPAs with cargo agents |

Verified by: 74 unit tests; live HTTP probes of the Fastify 5 server; both migrations applied to Postgres 16 with 16 impersonated attack attempts (all blocked); production web builds (demo + keyless) exercised in Chromium at 320/390/834/1440px.
