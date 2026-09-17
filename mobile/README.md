# Ewe ati Egbo — mobile app (Phase 2)

Not yet scaffolded. Phase 2 will create an Expo SDK 54 · TypeScript · expo-router app
here, mirroring the house pattern in `../../Amona/mobile` and `../../karin/mobile`:

```
mobile/
├── app/            # expo-router routes: (customer tabs), auth/, seller/, admin/
├── src/
│   ├── components/ # Button, Card, TrustPanel, VerificationBadge, ProductCard...
│   ├── data/       # mockData.ts — demo mode without live keys
│   ├── theme/      # theme.ts — brand palette from docs/brand-guidelines.md
│   ├── state/      # auth + cart
│   └── lib/        # supabaseClient.ts, stripe.ts, search.ts
├── app.config.js
├── .env.example    # EXPO_PUBLIC_SUPABASE_URL, ANON_KEY, STRIPE_PUBLISHABLE_KEY
└── package.json
```

Build against `../docs/screens.md` (UI), `../docs/data-model.md` (data) and
`../docs/compliance.md` (rules enforced server-side via Supabase Edge Functions).
