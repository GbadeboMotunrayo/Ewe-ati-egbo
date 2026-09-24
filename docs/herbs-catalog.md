# Ewe ati Egbo — Botanical Catalogue (Starter Set)

The seed of the multilingual botanical dictionary — common Nigerian/Yoruba herbs
(*ewe* = leaves, *egbo* = roots, *agbo* = herbal decoctions). This is the human-readable
mirror of the machine data in [`shared/src/data/herbs.ts`](../shared/src/data/herbs.ts),
which the backend seeds into Postgres and the app searches.

> **Important framing.** The "traditional use" column is **ethnobotanical / cultural
> reference only** — how a herb is described in Yoruba/Nigerian tradition. It is **not
> medical advice, not evaluated by any regulator, and must never be reproduced as a
> health/sales claim on a product listing.** The compliance engine
> ([`shared/src/logic/compliance.ts`](../shared/src/logic/compliance.ts)) blocks exactly
> that. Each row carries a **flag**: 🟢 green = generally listable · 🟠 amber = needs
> review/docs · 🔴 red = blocked (toxic or medicine-only).

Sources: DiscoverYoruba, tewetegbo.com (including its detailed
["agbo formula" breakdown](https://tewetegbo.com/agbo-yoruba-herbal-mixture-formula/),
§8), botanicaonline, Guardian NG / Nigerian Medicine list, plus 5 entries
cross-checked out of the community compilation
["Yoruba Medicinal Leaves and Names"](https://www.scribd.com/document/506090256/Lists-of-Yoruba-Medicinal-Leaves-and-Herbs)
(§9 below — that source is ~200+ names across 8 mostly-paywalled pages and is
**not itself verified**; only the 5 rows we cross-checked were added), plus 5
mainstream vitality/stamina botanicals (§10) cross-checked against general
botanical knowledge. Curated + cross-checked against documented botanical names.
**Not exhaustive** — a starting 59, structured to extend by tradition and language.

## Categories

| # | Category | What's in it |
|---|----------|--------------|
| 1 | Leafy herbs & vegetables | Soup greens & aromatic leaves (ewe) |
| 2 | Spices, seeds & pods | Flavourings and ceremonial spices |
| 3 | Roots & rhizomes | Ginger, turmeric, bitter roots (egbo) |
| 4 | Barks, stems & chewing sticks | Neem, chewing sticks |
| 5 | Fruits, seeds & kola | Kola, bitter kola, star apple, bitter melon |
| 6 | Flowers, aromatics & teas | Zobo/roselle, lemongrass, leaf teas |
| 7 | Topical & cosmetic botanicals | Black soap, shea, henna, camwood, aloe |
| 8 | Traditional formulas (agbo) | Prepared medicinal decoctions — reference only |
| 9 | Candidate additions (unverified source) | Cross-checked picks from a community list — see note above |
| 10 | Vitality / stamina botanicals | High demand, high compliance risk — see note below |

---

## 1 · Leafy herbs & vegetables

| Yoruba | Other names | English | Botanical | Part | Traditional use (reference only) | Flag |
|---|---|---|---|---|---|---|
| Ewuro | Onugbu, Shuwaka | Bitter leaf | *Vernonia amygdalina* | Leaf | Bitterleaf soup; bitter tonic | 🟢 |
| Efirin | Nchanwu, Scent leaf | Clove basil / Scent leaf | *Ocimum gratissimum* | Leaf | Aromatic; teas for stomach & colds | 🟢 |
| Efirin wewe | — | Sweet basil | *Ocimum basilicum* | Leaf | Culinary aromatic | 🟢 |
| Ewedu | Rama, Ahihara | Jute mallow | *Corchorus olitorius* | Leaf | Draw-soup vegetable | 🟢 |
| Tete | Inine | Amaranth greens | *Amaranthus hybridus* | Leaf | Leafy vegetable | 🟢 |
| Ugu | Ikong-ubong | Fluted pumpkin leaf | *Telfairia occidentalis* | Leaf | Soup green; juiced as blood tonic | 🟢 |
| Gbure | Mgbolodi | Waterleaf | *Talinum triangulare* | Leaf | Soft vegetable, paired with ewedu | 🟢 |
| Soko | — | Celosia / Lagos spinach | *Celosia argentea* | Leaf | Everyday vegetable | 🟢 |
| Yanrin | Wild lettuce | African wild lettuce | *Launaea taraxacifolia* | Leaf | Salad green; general wellbeing | 🟢 |
| Arokeke | Utazi | Utazi | *Gongronema latifolium* | Leaf | Bitter garnish; bitters | 🟢 |
| Iyere (ewe) | Uziza leaf | W. African pepper leaf | *Piper guineense* | Leaf | Peppery soup leaf | 🟢 |
| Ebolo | — | Ebolo | *Crassocephalum crepidioides* | Leaf | Traditional vegetable | 🟠 PA alkaloids — pending adviser |
| Ewe igbale | Zogale, Moringa | Moringa | *Moringa oleifera* | Leaf & seed | Nutrient-dense supplement powder/tea | 🟢 |
| Odundun | Abamoda, Never-die | Air/Miracle plant | *Bryophyllum pinnatum* | Leaf | Applied to wounds/burns; "cooling" leaf | 🟠 |
| Akoko | Ogirisi | Boundary tree | *Newbouldia laevis* | Leaf | Ceremonial; fertility/titling rites | 🟠 |
| Rere | Abo rere | Coffee senna | *Senna occidentalis* | Leaf/seed | Bitter decoction leaf | 🔴 toxic seed — pending adviser |

## 2 · Spices, seeds & pods

| Yoruba | Other names | English | Botanical | Part | Traditional use | Flag |
|---|---|---|---|---|---|---|
| Ataare | Ose oji, Chitta | Alligator pepper | *Aframomum melegueta* | Seed | Pungent ceremonial spice | 🟢 |
| Eeru alamo | Uda, Grains of Selim | Negro pepper | *Xylopia aethiopica* | Fruit pod | Aromatic; postpartum pepper soups | 🟢 |
| Iyere | Uziza seed | W. African black pepper | *Piper guineense* | Seed | Peppery spice | 🟢 |
| Aidan | Prekese, Oshosho | Aidan fruit / Prekese | *Tetrapleura tetraptera* | Fruit | Aromatic soup fruit; postpartum | 🟢 |
| Ariwo | Ehuru | African nutmeg | *Monodora myristica* | Seed | Warm aromatic spice | 🟢 |
| Iru | Dawadawa, Ogiri | Locust bean | *Parkia biglobosa* | Fermented seed | Seasoning condiment | 🟢 |
| Oju ologbo | Were were | Crab's eye / Jequirity | *Abrus precatorius* | Seed | Traditional use; **highly toxic (abrin)** | 🔴 |

## 3 · Roots & rhizomes

| Yoruba | Other names | English | Botanical | Part | Traditional use | Flag |
|---|---|---|---|---|---|---|
| Atale | Jinja | Ginger | *Zingiber officinale* | Rhizome | Spice; warming infusion | 🟢 |
| Atale pupa | Gangamau | Turmeric | *Curcuma longa* | Rhizome | Colouring/culinary spice | 🟢 |
| Oruwo | Ezeogu | Brimstone tree | *Morinda lucida* | Root/leaf | Bitter base of fever decoctions | 🟠 |

## 4 · Barks, stems & chewing sticks

| Yoruba | Other names | English | Botanical | Part | Traditional use | Flag |
|---|---|---|---|---|---|---|
| Dongoyaro | Dogonyaro, Neem | Neem | *Azadirachta indica* | Leaf & bark | Fever & skin preparations | 🟠 |
| Orin ata | Pako ijebu | Chewing stick | *Massularia acuminata* | Stem | Oral care | 🟢 |
| Ayan | — | African satinwood | *Distemonanthus benthamianus* | Stem | Chewing stick | 🟢 |
| Lapalapa | Botije | Physic nut | *Jatropha curcas* | Leaf/seed/latex | Latex/leaf on skin; **seeds toxic** | 🔴 |

## 5 · Fruits, seeds & kola

| Yoruba | Other names | English | Botanical | Part | Traditional use | Flag |
|---|---|---|---|---|---|---|
| Orogbo | Aku ilu | Bitter kola | *Garcinia kola* | Seed | Chewed seed; ceremonial | 🟢 |
| Obi | Oji | Kola nut | *Cola acuminata* | Seed | Stimulant; hospitality/ceremony | 🟠 caffeine labelling — pending adviser |
| Agbalumo | Udara | African star apple | *Chrysophyllum albidum* | Fruit | Seasonal fruit | 🟢 |
| Ejinrin | Bitter melon | Balsam pear | *Momordica charantia* | Leaf/fruit | Bitter fruit in bitters | 🟠 |
| Ibepe | Gwanda, Pawpaw | Papaya | *Carica papaya* | Leaf & seed | Leaf infusions; fruit eaten | 🟠 |

## 6 · Flowers, aromatics & teas

| Yoruba | Other names | English | Botanical | Part | Traditional use | Flag |
|---|---|---|---|---|---|---|
| Isapa | Zobo, Yakuwa | Roselle / Hibiscus | *Hibiscus sabdariffa* | Calyx | Zobo drink & herbal teas | 🟢 |
| Koriko oba | Ewe tea | Lemongrass | *Cymbopogon citratus* | Leaf | Aromatic tea | 🟢 |
| Guava | Gilofa | Guava leaf | *Psidium guajava* | Leaf | Leaf tea for the stomach | 🟢 |
| Mangoro | — | Mango leaf | *Mangifera indica* | Leaf/bark | Traditional decoctions | 🟢 |

## 7 · Topical & cosmetic botanicals

| Yoruba | Other names | English | Botanical | Part | Traditional use | Flag |
|---|---|---|---|---|---|---|
| Ahon erin | Eti erin | Aloe vera | *Aloe barbadensis* | Leaf gel | Skin, burns, hair | 🟢 |
| Ose dudu | Alata samina | African black soap | *Plantain ash, cocoa pod & shea* | Prepared soap | Cleansing skin/hair | 🟢 |
| Ori | Kadanya | Shea butter | *Vitellaria paradoxa* | Nut butter | Moisturiser | 🟢 |
| Laali | Lalle | Henna | *Lawsonia inermis* | Leaf | Skin/hair decoration | 🟢 |
| Osun | Uhie | Camwood | *Baphia nitida* | Wood powder | Cosmetic skin powder | 🟢 |

## 8 · Traditional formulas (agbo) — reference only

These are **prepared medicinal decoctions**. Marketed to treat disease, they are
**medicines under UK law (MHRA)** and are **blocked** on the platform unless the seller
holds a THR/MA. Documented here — properly, not as an afterthought — so the
compliance engine recognises them by name, not just by keyword.

### How a formula is actually built

Source:
["Agbo: Yoruba Herbal Mixture Formula"](https://tewetegbo.com/agbo-yoruba-herbal-mixture-formula/).
Agbo isn't a random handful of leaves in water — it's assembled from herbs playing
**defined functional roles**, each contributing something specific to the mixture:

| Yoruba role | Function | Example herb |
|---|---|---|
| Iran Ewé Àti Egbò Àárín | Centre / coordinating herb | Ìpẹ̀ta (*Securidaca longipedunculata*) |
| Iran Ajẹ́ẹ̀gùn | Catalyst — activates the mixture | Ẹtù Àpáta |
| Iran Ewé Ara | "Miraculous" herbs | Abamoda, Ewe Alupaida |
| Iran Tawàrà | Penetrating (sharp/hot) herbs | Atare, Iyere |
| Iran Aporó/Ẹ̀rọ̀ | Symptom silencers | Palm kernel oil |
| Iran Olójú Éjì | Stabilising/normalising herbs | Ewuro (bitter leaf) |
| Iran Afọ Ìdọ̀tí Ara | Flushing (waste removal) | Bàrà Ẹ̀gúsí |
| Iran Àjẹsára | Immunity/strength boosters | Epo Ogano (mahogany bark) |
| Èròjà Ògùn | Supporting ingredients | Kanafuru (cloves), Atare, Iyere |
| Agbè Ògùn Rìn | Carriers/vehicles | Water, fermented corn water (omi ogi), shea butter |

A worked example the source gives for a blood-pressure formula: boil the centre herb
(Ipeta) as the base → squeeze in a stabilising herb (bitter leaf) → add a penetrating
ingredient (alligator pepper, optional) → the Ipeta liquid itself serves as the
carrier. Nothing in the mixture is arbitrary — which is exactly why a formula's
**name** (not just its ingredient list) is enough to identify a medicinal claim.

### Formulas by condition (why the claims engine watches for these names)

The source lists dozens of named agbo/ogun formulas, organised by what they're sold
to treat — this is the real-world vocabulary sellers use, in Yoruba, that a
keyword scanner limited to English medical terms would miss entirely:

| Category | Named formulas |
|---|---|
| Fever | Agbo Iba (malaria), Agbo Iba Ponto (typhoid) |
| Blood/pressure | Agbo BP, Agbo Eje Riru, Agbo Iletutu |
| Digestive | Agbo Jedi Jedi (haemorrhoids), Agbo Ogbe Inu (ulcers), Ogun Esuke (hiccups) |
| Neurological | Agbo Giri (convulsion), Ogun Isoye (memory) |
| Pain | Agbo Ara Riro (body pain), Agbo Opa Eyin (back pain), Ogun Awoka (arthritis) |
| Respiratory | Ogun Iko (cough), Ogun Belubelu (tonsillitis) |
| Reproductive | Agbo Eda, Agbo Atosi (STIs), Agbo Ale, Ogun Fibroid, Ogun Prostate |
| Metabolic | Agbo weight loss, Agbo Ito Sugar (diabetes) |
| Skin | Agbo Inarun (hives), Agbo Ela (cradle cap) |
| Organ | Ogun Jedojedo (hepatitis), Ogun Kidney Problem |

`shared/src/logic/compliance.ts`'s `CONDITIONS` list now includes the Yoruba terms
this surfaced (`giri`, `jedojedo`, `eje riru`) alongside the English conditions it
was missing (`prostate`, `tonsillitis`, `convulsion`, `hives`) — see
`shared/tests/compliance.test.ts` for the tests that lock this in.

| Yoruba | English | Typical botanicals | Flag |
|---|---|---|---|
| Agbo iba | Fever/malaria decoction | *Morinda lucida*, neem, lemongrass | 🔴 |
| Agbo jedi-jedi | "Internal heat"/haemorrhoid decoction | Multi-herb | 🔴 |

### Formula-role herbs added to the dictionary

Three herbs named above as functional roles, cross-checked and added individually
(the rest — Ẹtù Àpáta, Ewe Alupaida, Bàrà Ẹ̀gúsí — weren't confidently identifiable
to a specific species from the source alone, so were left out rather than guessed):

| Yoruba | English | Botanical | Role in formula | Flag |
|---|---|---|---|---|
| Ipeta | Violet tree | *Securidaca longipedunculata* | Centre/coordinating herb | 🔴 root/bark toxicity documented — not listable |
| Oganwo / Ogano | African mahogany | *Khaya senegalensis* | Immunity-booster bark | 🟠 fever/malaria associations — review |
| Kanafuru | Cloves | *Syzygium aromaticum* | Supporting ingredient | 🟢 ordinary culinary spice |

## 9 · Candidate additions (from an unverified community source)

Cross-checked picks out of
["Yoruba Medicinal Leaves and Names"](https://www.scribd.com/document/506090256/Lists-of-Yoruba-Medicinal-Leaves-and-Herbs)
— a dense, ~200+ name personal compilation, dialect variants (Oyo/Ekiti) included,
most of it behind Scribd's paywall and **not independently verified by us**. Only
these 5 rows were added, and only after checking each pairing against general
botanical references; one scientific-name pairing in the source (*afomo* /
mistletoe) looked mis-transcribed and was corrected here rather than copied as-is.
Treat the rest of that document as an unreviewed lead for a future pass, not a
source of truth on its own.

| Yoruba | English | Botanical | Part | Note | Flag |
|---|---|---|---|---|---|
| Ado / Ato | Bottle gourd | *Lagenaria siceraria* | Fruit | Dried shells used as containers | 🟢 |
| Adodo | Desmodium | *Desmodium* spp. | Leaf/whole plant | Chest/liver decoction associations — review | 🟠 |
| Afon | Chinaberry / Persian lilac | *Melia azedarach* | Leaf/fruit | **Fruit/seeds toxic if ingested** | 🔴 |
| Afomo | African mistletoe | *Tapinanthus bangwensis* | Leaf/stem | BP/diabetes folk claims; varies by host tree — review | 🟠 |
| Abura | Abura | *Mitragyna stipulosa* | Bark | Same genus as kratom (different species) — review | 🟠 |

## 10 · Vitality / stamina botanicals

Real, high commercial demand — and one of the most heavily enforced advertising
categories in the UK. A product marketed to enhance sexual performance is treated
as an unlicensed medicine; MHRA and the ASA actively police "improves sex drive,"
"longer-lasting," "boosts libido" wording specifically. **The compliant model
already exists on UK shelves**: Holland & Barrett and others sell Tribulus,
Maca and similar ingredients as plain food supplements, with no functional claim
on the label. That's the only way this category is listable here.

Only one of these five has a genuine Yoruba name we're confident about (*werepe*
for velvet bean) — the others are Ugandan, Brazilian, Cameroonian or
global-supplement in origin and are named honestly rather than guessed at, per
the same standard as the *afomo* correction in §9.

| Common name | Botanical | Part | Note | Flag |
|---|---|---|---|---|
| Mulondo (Mondia root) | *Mondia whitei* | Root | East African; also a food flavouring | 🟠 |
| Tribulus | *Tribulus terrestris* | Fruit/seed | Already sold in UK as an ordinary supplement | 🟠 |
| Muira puama | *Ptychopetalum olacoides* | Root/bark | Brazilian vitality tonic ingredient | 🟠 |
| Yohimbe | *Pausinystalia yohimbe* | Bark | **Documented cardiovascular/anxiety risk** | 🔴 |
| Werepe (velvet bean) | *Mucuna pruriens* | Seed | Contains L-DOPA — genuine drug-interaction risk | 🟠 |

The claims engine ([`shared/src/logic/compliance.ts`](../shared/src/logic/compliance.ts))
now also catches "sex drive," "last longer in bed," "improves sexual performance"
and similar phrasing directly — see `shared/tests/compliance.test.ts` for the test
that locks this in, including the exact wording this section was built to stress-test.

---

### How this feeds the product

- **Search** — every name column powers the multilingual resolver
  (`shared/src/logic/search.ts`): a customer typing *ewuro*, *onugbu*, *bitter leaf* or
  *Vernonia amygdalina* lands on the same botanical.
- **Classification** — `platformClass` seeds a product's default class (A/B/C/D).
- **Compliance** — `regulatoryFlag` drives the 🟢/🟠/🔴 restricted-ingredient engine;
  🔴 rows can never be listed as ingestibles, 🟠 rows route to review.
- **Extensibility** — add languages (Igbo, Twi, Hausa, Arabic, Hindi) and new
  traditions by adding rows; the engine doesn't change.
