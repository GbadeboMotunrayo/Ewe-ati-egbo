import type { Herb } from '../types/botanical';

/**
 * Starter botanical dictionary — common Nigerian/Yoruba herbs (ewe, egbo, agbo).
 * Curated from ethnobotanical sources (DiscoverYoruba, tewetegbo, botanicaonline,
 * Guardian NG / NMC list) + widely-documented botanical names. NOT exhaustive and
 * NOT medical advice: `traditionalUse` is cultural reference only and must never be
 * reproduced as a product health claim (see docs/compliance.md).
 *
 * `regulatoryFlag` seeds the restricted-ingredient engine:
 *   green = generally listable · amber = needs review/docs · red = blocked.
 */
export const HERBS: Herb[] = [
  // ── Leafy herbs & vegetables ──────────────────────────────────────────────
  { id: 'ewuro', yoruba: 'Ewuro', otherNames: ['Onugbu', 'Shuwaka', 'Etidot'], english: 'Bitter leaf', botanical: 'Vernonia amygdalina', part: 'Leaf', category: 'leafy_herbs', traditionalUse: 'Staple leafy vegetable for bitterleaf soup; traditionally taken as a bitter tonic.', platformClass: 'A', regulatoryFlag: 'green' },
  { id: 'efirin', yoruba: 'Efirin', otherNames: ['Nchanwu', 'Daidoya', 'Scent leaf'], english: 'Clove basil / Scent leaf', botanical: 'Ocimum gratissimum', part: 'Leaf', category: 'leafy_herbs', traditionalUse: 'Aromatic culinary leaf; traditionally used in teas for the stomach and colds.', platformClass: 'A', regulatoryFlag: 'green' },
  { id: 'efirin-wewe', yoruba: 'Efirin wewe', otherNames: ['Sweet basil'], english: 'Sweet basil', botanical: 'Ocimum basilicum', part: 'Leaf', category: 'leafy_herbs', traditionalUse: 'Culinary aromatic herb.', platformClass: 'A', regulatoryFlag: 'green' },
  { id: 'ewedu', yoruba: 'Ewedu', otherNames: ['Rama', 'Ahihara'], english: 'Jute mallow', botanical: 'Corchorus olitorius', part: 'Leaf', category: 'leafy_herbs', traditionalUse: 'Classic draw-soup vegetable.', platformClass: 'A', regulatoryFlag: 'green' },
  { id: 'tete', yoruba: 'Tete', otherNames: ['Inine', 'Green amaranth'], english: 'Amaranth greens', botanical: 'Amaranthus hybridus', part: 'Leaf', category: 'leafy_herbs', traditionalUse: 'Common leafy vegetable.', platformClass: 'A', regulatoryFlag: 'green' },
  { id: 'ugu', yoruba: 'Ugu', otherNames: ['Ikong-ubong'], english: 'Fluted pumpkin leaf', botanical: 'Telfairia occidentalis', part: 'Leaf', category: 'leafy_herbs', traditionalUse: 'Nutrient-rich soup vegetable; leaves juiced traditionally as a blood tonic.', platformClass: 'A', regulatoryFlag: 'green' },
  { id: 'gbure', yoruba: 'Gbure', otherNames: ['Mgbolodi', 'Waterleaf'], english: 'Waterleaf', botanical: 'Talinum triangulare', part: 'Leaf', category: 'leafy_herbs', traditionalUse: 'Soft leafy vegetable, often paired with ewedu.', platformClass: 'A', regulatoryFlag: 'green' },
  { id: 'soko', yoruba: 'Soko', otherNames: ['Lagos spinach'], english: 'Celosia / Lagos spinach', botanical: 'Celosia argentea', part: 'Leaf', category: 'leafy_herbs', traditionalUse: 'Everyday leafy vegetable.', platformClass: 'A', regulatoryFlag: 'green' },
  { id: 'yanrin', yoruba: 'Yanrin', otherNames: ['Wild lettuce'], english: 'African wild lettuce', botanical: 'Launaea taraxacifolia', part: 'Leaf', category: 'leafy_herbs', traditionalUse: 'Salad/vegetable green; traditionally eaten for general wellbeing.', platformClass: 'A', regulatoryFlag: 'green' },
  { id: 'utazi', yoruba: 'Arokeke', otherNames: ['Utazi', 'Utasi'], english: 'Utazi', botanical: 'Gongronema latifolium', part: 'Leaf', category: 'leafy_herbs', traditionalUse: 'Bitter garnish leaf; traditionally used in soups and as a bitter.', platformClass: 'A', regulatoryFlag: 'green' },
  { id: 'uziza-leaf', yoruba: 'Iyere (ewe)', otherNames: ['Uziza leaf', 'Ata iyere'], english: 'West African black pepper leaf', botanical: 'Piper guineense', part: 'Leaf', category: 'leafy_herbs', traditionalUse: 'Peppery, aromatic soup leaf.', platformClass: 'A', regulatoryFlag: 'green' },
  { id: 'ebolo', yoruba: 'Ebolo', otherNames: ['Yoruban bologi'], english: 'Ebolo', botanical: 'Crassocephalum crepidioides', part: 'Leaf', category: 'leafy_herbs', traditionalUse: 'Traditional leafy vegetable.', platformClass: 'A', regulatoryFlag: 'green' },

  // ── Spices, seeds & pods ──────────────────────────────────────────────────
  { id: 'ataare', yoruba: 'Ataare', otherNames: ['Ose oji', 'Chitta'], english: 'Alligator pepper', botanical: 'Aframomum melegueta', part: 'Seed', category: 'spices_seeds', traditionalUse: 'Pungent ceremonial spice.', platformClass: 'A', regulatoryFlag: 'green' },
  { id: 'eeru', yoruba: 'Eeru alamo', otherNames: ['Uda', 'Grains of Selim'], english: 'Negro pepper / Grains of Selim', botanical: 'Xylopia aethiopica', part: 'Fruit pod', category: 'spices_seeds', traditionalUse: 'Aromatic spice; in postpartum pepper soups.', platformClass: 'A', regulatoryFlag: 'green' },
  { id: 'iyere', yoruba: 'Iyere', otherNames: ['Uziza seed', 'Ashanti pepper'], english: 'West African black pepper', botanical: 'Piper guineense', part: 'Seed', category: 'spices_seeds', traditionalUse: 'Peppery culinary spice.', platformClass: 'A', regulatoryFlag: 'green' },
  { id: 'aidan', yoruba: 'Aidan', otherNames: ['Prekese', 'Osakirisa', 'Oshosho'], english: 'Aidan fruit / Prekese', botanical: 'Tetrapleura tetraptera', part: 'Fruit', category: 'spices_seeds', traditionalUse: 'Aromatic fruit for soups; traditional postpartum use.', platformClass: 'A', regulatoryFlag: 'green' },
  { id: 'ehuru', yoruba: 'Ariwo', otherNames: ['Ehuru', 'Airigbo', 'African nutmeg'], english: 'Calabash / African nutmeg', botanical: 'Monodora myristica', part: 'Seed', category: 'spices_seeds', traditionalUse: 'Warm aromatic spice.', platformClass: 'A', regulatoryFlag: 'green' },
  { id: 'iru', yoruba: 'Iru', otherNames: ['Dawadawa', 'Ogiri okpei'], english: 'Locust bean', botanical: 'Parkia biglobosa', part: 'Fermented seed', category: 'spices_seeds', traditionalUse: 'Fermented seasoning condiment.', platformClass: 'A', regulatoryFlag: 'green' },

  // ── Roots & rhizomes ──────────────────────────────────────────────────────
  { id: 'atale', yoruba: 'Atale', otherNames: ['Jinja', 'Ginger'], english: 'Ginger', botanical: 'Zingiber officinale', part: 'Rhizome', category: 'roots_rhizomes', traditionalUse: 'Culinary spice; traditional warming infusion.', platformClass: 'A', regulatoryFlag: 'green' },
  { id: 'atale-pupa', yoruba: 'Atale pupa', otherNames: ['Turmeric', 'Gangamau'], english: 'Turmeric', botanical: 'Curcuma longa', part: 'Rhizome', category: 'roots_rhizomes', traditionalUse: 'Culinary/colouring spice.', platformClass: 'A', regulatoryFlag: 'green' },
  { id: 'oruwo', yoruba: 'Oruwo', otherNames: ['Brimstone tree', 'Ezeogu'], english: 'Brimstone tree', botanical: 'Morinda lucida', part: 'Root/leaf', category: 'roots_rhizomes', traditionalUse: 'Bitter component of traditional malaria/fever decoctions.', platformClass: 'D', regulatoryFlag: 'amber', note: 'Associated with medicinal (anti-malarial) claims — review/evidence required; no disease claims permitted.' },

  // ── Barks, stems & chewing sticks ─────────────────────────────────────────
  { id: 'dongoyaro', yoruba: 'Dongoyaro', otherNames: ['Dogonyaro', 'Neem'], english: 'Neem', botanical: 'Azadirachta indica', part: 'Leaf & bark', category: 'barks_stems', traditionalUse: 'Bitter leaf/bark widely used in traditional fever and skin preparations.', platformClass: 'A', regulatoryFlag: 'amber', note: 'Strongly associated with anti-malarial claims; internal-use products need review.' },
  { id: 'orin-ata', yoruba: 'Orin ata', otherNames: ['Pako ijebu', 'Chewing stick'], english: 'Chewing stick', botanical: 'Massularia acuminata', part: 'Stem', category: 'barks_stems', traditionalUse: 'Traditional chewing stick for oral care.', platformClass: 'A', regulatoryFlag: 'green' },
  { id: 'ayan', yoruba: 'Ayan', otherNames: ['African satinwood'], english: 'African satinwood', botanical: 'Distemonanthus benthamianus', part: 'Stem', category: 'barks_stems', traditionalUse: 'Traditional chewing stick.', platformClass: 'A', regulatoryFlag: 'green' },

  // ── Leaves used medicinally / topically ───────────────────────────────────
  { id: 'moringa', yoruba: 'Ewe igbale', otherNames: ['Zogale', 'Okwe oyibo', 'Moringa'], english: 'Moringa / Drumstick tree', botanical: 'Moringa oleifera', part: 'Leaf & seed', category: 'leafy_herbs', traditionalUse: 'Nutrient-dense leaf, taken as a food supplement powder or tea.', platformClass: 'B', regulatoryFlag: 'green' },
  { id: 'odundun', yoruba: 'Odundun', otherNames: ['Abamoda', 'Never-die', 'Resurrection plant'], english: 'Miracle/Air plant', botanical: 'Bryophyllum pinnatum', part: 'Leaf', category: 'leafy_herbs', traditionalUse: 'Leaf traditionally applied to wounds, burns and swellings; a "cooling" leaf.', platformClass: 'C', regulatoryFlag: 'amber', note: 'Topical use only in cosmetics; internal medicinal claims not permitted.' },
  { id: 'eti-erin', yoruba: 'Ahon erin', otherNames: ['Eti erin', 'Aloe'], english: 'Aloe vera', botanical: 'Aloe barbadensis', part: 'Leaf gel', category: 'topical_cosmetic', traditionalUse: 'Gel used on skin, burns and hair.', platformClass: 'C', regulatoryFlag: 'green' },
  { id: 'akoko', yoruba: 'Akoko', otherNames: ['Fertility leaf', 'Ogirisi'], english: 'Boundary tree', botanical: 'Newbouldia laevis', part: 'Leaf', category: 'leafy_herbs', traditionalUse: 'Ceremonial leaf; used traditionally in fertility and titling rites.', platformClass: 'A', regulatoryFlag: 'amber', note: 'Often carries fertility claims — review before listing.' },
  { id: 'rere', yoruba: 'Rere', otherNames: ['Abo rere', 'Coffee senna'], english: 'Coffee senna', botanical: 'Senna occidentalis', part: 'Leaf/seed', category: 'leafy_herbs', traditionalUse: 'Traditional bitter decoction leaf.', platformClass: 'D', regulatoryFlag: 'amber', note: 'Laxative/medicinal associations — review required.' },
  { id: 'ejinrin', yoruba: 'Ejinrin', otherNames: ['Ejinrin wewe', 'Bitter melon'], english: 'Bitter melon / Balsam pear', botanical: 'Momordica charantia', part: 'Leaf/fruit', category: 'fruits_kola', traditionalUse: 'Bitter fruit/leaf used in traditional bitters.', platformClass: 'B', regulatoryFlag: 'amber', note: 'Blood-sugar claims common — no disease claims permitted.' },
  { id: 'ibepe', yoruba: 'Ibepe', otherNames: ['Gwanda', 'Okwuru bekee', 'Pawpaw'], english: 'Papaya / Pawpaw', botanical: 'Carica papaya', part: 'Leaf & seed', category: 'fruits_kola', traditionalUse: 'Leaf infusions used traditionally; fruit eaten.', platformClass: 'A', regulatoryFlag: 'amber', note: 'Leaf products carry medicinal (fever) claims — review.' },
  { id: 'guava', yoruba: 'Guava', otherNames: ['Gilofa', 'Goba'], english: 'Guava leaf', botanical: 'Psidium guajava', part: 'Leaf', category: 'flowers_teas', traditionalUse: 'Leaf tea taken traditionally for the stomach.', platformClass: 'A', regulatoryFlag: 'green' },
  { id: 'mangoro', yoruba: 'Mangoro', otherNames: ['Mango leaf'], english: 'Mango leaf', botanical: 'Mangifera indica', part: 'Leaf/bark', category: 'flowers_teas', traditionalUse: 'Leaf/bark used in traditional decoctions.', platformClass: 'A', regulatoryFlag: 'green' },

  // ── Fruits, seeds & kola ──────────────────────────────────────────────────
  { id: 'orogbo', yoruba: 'Orogbo', otherNames: ['Bitter kola', 'Aku ilu'], english: 'Bitter kola', botanical: 'Garcinia kola', part: 'Seed', category: 'fruits_kola', traditionalUse: 'Chewed seed; ceremonial and traditional use.', platformClass: 'A', regulatoryFlag: 'green' },
  { id: 'obi', yoruba: 'Obi', otherNames: ['Kola nut', 'Oji'], english: 'Kola nut', botanical: 'Cola acuminata', part: 'Seed', category: 'fruits_kola', traditionalUse: 'Stimulant nut, central to hospitality and ceremony.', platformClass: 'A', regulatoryFlag: 'green' },
  { id: 'agbalumo', yoruba: 'Agbalumo', otherNames: ['Udara', 'African star apple'], english: 'African star apple', botanical: 'Chrysophyllum albidum', part: 'Fruit', category: 'fruits_kola', traditionalUse: 'Seasonal fruit.', platformClass: 'A', regulatoryFlag: 'green' },

  // ── Flowers, aromatics & teas ─────────────────────────────────────────────
  { id: 'zobo', yoruba: 'Isapa', otherNames: ['Zobo', 'Yakuwa', 'Roselle'], english: 'Roselle / Hibiscus', botanical: 'Hibiscus sabdariffa', part: 'Calyx', category: 'flowers_teas', traditionalUse: 'Calyces brewed into the zobo drink and herbal teas.', platformClass: 'A', regulatoryFlag: 'green' },
  { id: 'koriko-oba', yoruba: 'Koriko oba', otherNames: ['Ewe tea', 'Lemongrass'], english: 'Lemongrass', botanical: 'Cymbopogon citratus', part: 'Leaf', category: 'flowers_teas', traditionalUse: 'Aromatic leaf brewed as tea.', platformClass: 'A', regulatoryFlag: 'green' },

  // ── Topical & cosmetic botanicals ─────────────────────────────────────────
  { id: 'ose-dudu', yoruba: 'Ose dudu', otherNames: ['Alata samina', 'African black soap'], english: 'African black soap', botanical: 'Plantain ash, cocoa pod & shea blend', part: 'Prepared soap', category: 'topical_cosmetic', traditionalUse: 'Traditional cleansing soap for skin and hair.', platformClass: 'C', regulatoryFlag: 'green' },
  { id: 'ori', yoruba: 'Ori', otherNames: ['Shea butter', 'Kadanya'], english: 'Shea butter', botanical: 'Vitellaria paradoxa', part: 'Nut butter', category: 'topical_cosmetic', traditionalUse: 'Moisturising body/hair butter.', platformClass: 'C', regulatoryFlag: 'green' },
  { id: 'laali', yoruba: 'Laali', otherNames: ['Lalle', 'Henna'], english: 'Henna', botanical: 'Lawsonia inermis', part: 'Leaf', category: 'topical_cosmetic', traditionalUse: 'Leaf paste for skin/hair decoration.', platformClass: 'C', regulatoryFlag: 'green' },
  { id: 'osun', yoruba: 'Osun', otherNames: ['Camwood', 'Uhie'], english: 'Camwood', botanical: 'Baphia nitida', part: 'Wood powder', category: 'topical_cosmetic', traditionalUse: 'Reddish powder used on skin cosmetically.', platformClass: 'C', regulatoryFlag: 'green' },

  // ── Restricted / toxic — hard blocks ──────────────────────────────────────
  { id: 'lapalapa', yoruba: 'Lapalapa', otherNames: ['Botije', 'Physic nut'], english: 'Physic nut', botanical: 'Jatropha curcas', part: 'Leaf/seed/latex', category: 'barks_stems', traditionalUse: 'Latex/leaf used traditionally on skin; seeds are toxic.', platformClass: 'D', regulatoryFlag: 'red', note: 'Seeds/oil toxic if ingested — not listable as an ingestible product.' },
  { id: 'oju-ologbo', yoruba: 'Oju ologbo', otherNames: ['Were were', 'Jequirity'], english: "Crab's eye / Jequirity", botanical: 'Abrus precatorius', part: 'Seed', category: 'spices_seeds', traditionalUse: 'Seeds used traditionally; highly toxic.', platformClass: 'D', regulatoryFlag: 'red', note: 'Seeds contain abrin — poisonous. Blocked.' },

  // ── Traditional formulas (agbo) — reference only, not free-listable ────────
  { id: 'agbo-iba', yoruba: 'Agbo iba', otherNames: ['Malaria agbo'], english: 'Fever/malaria decoction', botanical: 'Multi-herb decoction (e.g. Morinda lucida, neem, lemongrass)', part: 'Mixed decoction', category: 'traditional_formula', traditionalUse: 'A prepared bitter decoction traditionally taken for fever/malaria.', platformClass: 'D', regulatoryFlag: 'red', note: 'Marketed to treat disease = a medicine (MHRA). Blocked unless THR/MA held.' },
  { id: 'agbo-jedi', yoruba: 'Agbo jedi-jedi', otherNames: ['Jedi agbo'], english: 'Haemorrhoid/"internal heat" decoction', botanical: 'Multi-herb decoction', part: 'Mixed decoction', category: 'traditional_formula', traditionalUse: 'Prepared decoction traditionally taken for "jedi-jedi".', platformClass: 'D', regulatoryFlag: 'red', note: 'Medicinal claim — blocked unless registered.' },
];

export const HERB_COUNT = HERBS.length;
