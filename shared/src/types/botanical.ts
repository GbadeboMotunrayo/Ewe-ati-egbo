// Domain types for the botanical dictionary — the platform's data moat.
// Shared by backend (seed + API) and mobile (search + product classification).

export type HerbCategory =
  | 'leafy_herbs' // leafy herbs & vegetables (ewe)
  | 'spices_seeds' // spices, seeds & pods
  | 'roots_rhizomes' // roots & rhizomes (egbo)
  | 'barks_stems' // barks, stems & chewing sticks
  | 'fruits_kola' // fruits, seeds & kola
  | 'flowers_teas' // flowers, aromatics & infusions
  | 'topical_cosmetic' // topical / cosmetic botanicals
  | 'traditional_formula'; // prepared agbo decoctions (medicinal)

export const HERB_CATEGORY_LABELS: Record<HerbCategory, string> = {
  leafy_herbs: 'Leafy herbs & vegetables',
  spices_seeds: 'Spices, seeds & pods',
  roots_rhizomes: 'Roots & rhizomes',
  barks_stems: 'Barks, stems & chewing sticks',
  fruits_kola: 'Fruits, seeds & kola',
  flowers_teas: 'Flowers, aromatics & teas',
  topical_cosmetic: 'Topical & cosmetic botanicals',
  traditional_formula: 'Traditional formulas (agbo)',
};

// Maps to docs/compliance.md product classes.
export type PlatformClass = 'A' | 'B' | 'C' | 'D';

// Traffic-light for the restricted-ingredient engine (docs/compliance.md §3).
export type RegulatoryFlag = 'green' | 'amber' | 'red';

export interface Herb {
  id: string;
  yoruba: string; // primary Yoruba name (ewe / egbo / agbo)
  otherNames: string[]; // Igbo / Hausa / other vernacular + common spellings
  english: string; // English / common name
  botanical: string; // scientific name
  part: string; // plant part used
  category: HerbCategory;
  /**
   * ETHNOBOTANICAL / CULTURAL REFERENCE ONLY — how the herb is traditionally
   * described. NOT medical advice, NOT evaluated by any regulator, and MUST NOT
   * be reproduced as a sales/health claim on a product listing (see compliance.md).
   */
  traditionalUse: string;
  platformClass: PlatformClass; // default class if listed as a product
  regulatoryFlag: RegulatoryFlag; // green = listable, amber = review, red = blocked
  note?: string; // safety / restriction note
}
