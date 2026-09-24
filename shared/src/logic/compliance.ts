import type { Herb, PlatformClass, RegulatoryFlag } from '../types/botanical';
import { findHerbsInText } from './search';
import { editDistance, foldText, normaliseText, normaliseWords } from './text';

/**
 * Compliance engine v2 (docs/compliance.md §3–4) — pure, testable logic shared by
 * backend (enforced at publish) and mobile (live seller feedback).
 *
 * Pipeline, like airport security:
 *   1. WASH    — normalise the text (accents, look-alike letters, hidden chars, c.u.r.e.s).
 *   2. EXCUSE  — remove standard disclaimers and known-harmless phrases ("sweet treats").
 *   3. SCAN    — look for conditions (incl. misspellings & Yoruba/Pidgin), claim phrases, and weak verbs.
 *   4. IDENTIFY— find every dictionary herb named in the text; worst flag wins.
 *   5. CLASSIFY— the stricter of the seller's class and each herb's class applies.
 *
 * Deterministic rules make the block; every decision carries human-readable reasons.
 */

// ── Rule tables ────────────────────────────────────────────────────────────────

/** Diseases/conditions. Mentioning one on a listing is a medicinal claim → blocked. */
const CONDITIONS = [
  'malaria', 'typhoid', 'diabetes', 'diabetic', 'fibroid', 'fibroids', 'infection', 'infections', 'cancer', 'cancers',
  'tumour', 'tumor', 'ulcer', 'ulcers', 'hypertension', 'infertility', 'infertile', 'barren', 'barrenness',
  'impotence', 'impotent', 'staph', 'staphylococcus', 'hepatitis', 'arthritis', 'rheumatism', 'fever', 'fevers',
  'piles', 'haemorrhoid', 'haemorrhoids', 'hemorrhoid', 'hemorrhoids', 'gonorrhoea', 'gonorrhea', 'syphilis',
  'std', 'stds', 'sti', 'stis', 'hiv', 'hiv aids', 'covid', 'coronavirus', 'asthma', 'epilepsy', 'stroke', 'insomnia',
  'depression', 'jaundice', 'pneumonia', 'tuberculosis', 'cholera', 'dysentery', 'sickle', 'kidney stones',
  'high blood pressure', 'blood pressure', 'blood sugar', 'high bp', 'weak erection', 'erectile', 'low sperm count',
  'sperm count', 'menstrual pain', 'period pain', 'eczema', 'psoriasis', 'prostate', 'tonsillitis', 'tonsilitis',
  'convulsion', 'convulsions', 'hives',
  // Sexual-function claims — one of the most heavily-enforced UK ad/medicine categories.
  'sex drive', 'low libido', 'premature ejaculation', 'weak manhood', 'weak in bed',
  // Yoruba / Pidgin / Igbo vernacular for conditions & treatment
  'iba', 'jedi', 'jedi jedi', 'aisan', 'arun', 'atosi', 'ako iba', 'belle wahala', 'good for sugar', 'sugar patient', 'sugar patients',
  'ogwu', 'ogwu iba', 'o n wo', 'wo iba', 'wo arun', 'na medicine', 'giri', 'jedojedo', 'jedo jedo', 'eje riru',
];

/** Misspelling targets: conditions long enough for fuzzy (edit distance 1) matching. */
// ≥7 letters and same first letter keeps real words out ("pickle"≠sickle, "dancer"≠cancer).
const FUZZY_CONDITIONS = CONDITIONS.filter((c) => !c.includes(' ') && c.length >= 7 && c !== 'cancers');
const EXTRA_MISSPELLINGS = ['tyfoid', 'taifod', 'maleria', 'malarial', 'dibetes', 'diabetis'];

/** Phrases that assert a health effect → blocked even without a named condition. */
const STRONG_CLAIM_PATTERNS: RegExp[] = [
  /\bcur(e|es|ed|ing|ative|atives)\b/,
  /\bcure ?all\b/,
  /\bheal(s|ed|ing|er|ers)?\b/,
  /\bgets? rid of\b/,
  /\b(fights?|kills?|destroys?|eliminates?|flush(es)? out|wipes? out) (germs?|bacteria|virus(es)?|infections?|parasites?|worms?|toxins?|disease|sickness|illness)\b/,
  /\bflush(es|ing)? (out )?toxins?\b/,
  /\bboost(s|ing|er)? (your )?(fertility|immunity|immune system|libido|sperm|manpower|drive|sex drive|stamina)\b/,
  /\bfertility (booster|boost|enhancer)\b/,
  /\b(last|lasts|lasting|stay|stays|staying) (longer|harder|hard)\b(?: in bed)?/,
  /\b(longer|harder) (lasting |sex\b)/,
  /\bimprove(s|d)? (your )?(sex drive|sex life|sexual performance|sexual stamina)\b/,
  /\b(lower|lowers|lowering|reduce|reduces|reducing|control|controls|regulate|regulates|balance|balances) (your )?(blood sugar|sugar level|sugar levels|blood pressure|bp|cholesterol)\b/,
  /\banti ?(malarial|bacterial|biotic|biotics|viral|fungal|inflammatory|cancer|diabetic|hypertensive|septic|oxidant)s?\b/,
  /\b(antimalarial|antibacterial|antibiotic|antiviral|antifungal|antidiabetic|antiseptic)s?\b/,
  /\b(cleanse|cleanses|cleansing|flush|flushes|purif(y|ies)) (the |your )?(blood|system|womb|liver|kidneys?|stomach|intestines?)\b/,
  /\b(womb|blood|liver|kidney|colon) (cleanser|cleanse|detox|tonic|flush)\b/,
  /\b(medicine|medicinal|medication|drug) (for|to)\b/,
  /\b(works|acts) like (a )?(medicine|drug|antibiotic)\b/,
  /\b(clinically|scientifically|doctor) (proven|tested|approved|recommended)\b/,
  /\bmhra approved\b/,
  /\b(weight loss|lose weight|burns? fat|fat burner|slimming)\b/,
  /\bfor (the )?treatment of\b/,
];

/** Lone verbs that are often innocent ("sweet treats") → review, not block. */
const WEAK_CLAIM_PATTERNS: RegExp[] = [
  /\btreat(s|ed|ing|ment|ments)?\b/,
  /\bprevent(s|ed|ing|ion|ative)?\b/,
  /\bremed(y|ies)\b/,
  /\bdetox(es|ed|ing|ify|ifies|ifying|ification)?\b/,
  /\btherap(y|eutic|ies)\b/,
  /\bpotent\b/,
  /\bpowerful (herb|root|mixture|agbo)\b/,
];

/** Emoji that imply medical use. */
const MEDICAL_EMOJI: Array<{ re: RegExp; label: string; strong: boolean }> = [
  { re: /\u{1F99F}/u, label: '🦟 (mosquito/malaria)', strong: true },
  { re: /[\u{1F48A}\u{1F489}\u{1FA7A}\u{1F9A0}\u{1FA78}]/u, label: '💊/💉/🩺/🦠 (medical emoji)', strong: false },
];

/**
 * Standard disclaimers — removed before scanning so compliant copy isn't punished.
 * Tightly bounded (they must END in "any disease/condition…") so a seller can't
 * hide a claim inside one: "not intended to cure anything but cures malaria" still blocks.
 */
const VERBS = '(?:diagnose|treat|cure|prevent|mitigate|heal)';
const VERB_LIST = `${VERBS}(?:\\s*(?:,|/|or|and)\\s*(?:or\\s+|and\\s+)?${VERBS})*`;
const ANY_ILLNESS = '(?:any\\s+)?(?:disease|diseases|illness|illnesses|condition|conditions|medical condition|medical conditions|ailment|ailments|infection|infections)';
const DISCLAIMER_PATTERNS: RegExp[] = [
  new RegExp(`\\b(?:this product\\s+)?(?:is\\s+)?not\\s+(?:intended|meant|designed)\\s+to\\s+${VERB_LIST}\\s+${ANY_ILLNESS}\\b`, 'g'),
  new RegExp(`\\b(?:this product\\s+)?(?:does|do|will)\\s+not\\s+${VERB_LIST}\\s+${ANY_ILLNESS}\\b`, 'g'),
  /\b(?:please\s+)?(?:consult|speak to|ask)\s+(?:your|a)\s+(?:gp|doctor|pharmacist|healthcare professional|healthcare provider)\b/g,
  /\bnot a (?:substitute|replacement) for (?:medical|professional) (?:advice|treatment)\b/g,
  /\bno (?:health|medicinal|medical) claims? (?:are |is )?(?:made|implied)\b/g,
];

/** Known-harmless phrases that contain trigger words. */
const ALLOW_PHRASES: RegExp[] = [
  /\b(sweet|tasty|little|special|festive|christmas|party|dog|cat|pet|kids|children s|chocolate|biscuit) treats?\b/g,
  /\btreats? (for|to share with) (the )?(whole )?(family|friends|kids|children|guests)\b/g,
  /\bprevents? (moisture|spillage|spills|leaks|leakage|clumping|caking|oxidation|breakage|crushing|damage|mould|mold)\b/g,
  /\bcancer research( uk)?\b/g,
  /\bhome remedy style\b/g,
  /\bcured (meat|meats|fish|ham|beef|pork|sausage)\b/g,
  /\bsun cured|air cured|salt cured|smoke cured|cured and dried|cured in the sun\b/g,
  /\bheal(s|ing)? (ville|farm|field)\b/g,
];

// ── Scanning ───────────────────────────────────────────────────────────────────

export type ClaimSeverity = 'none' | 'weak' | 'strong';

export interface ClaimScan {
  ok: boolean;
  /** strong = block, weak = human review, none = clean */
  severity: ClaimSeverity;
  matches: string[];
}

/** Disclaimers are matched on folded text that still has punctuation. */
function stripDisclaimers(folded: string): string {
  let t = folded;
  for (const re of DISCLAIMER_PATTERNS) t = t.replace(re, ' ');
  return t;
}

/** Allow-phrases are matched on normalised words. */
function stripAllowed(normalised: string): string {
  let t = normalised;
  for (const re of ALLOW_PHRASES) t = t.replace(re, ' ');
  return t;
}

/** Scan seller free-text (title + description + directions) for medicinal claims. */
export function scanClaims(text: string): ClaimScan {
  const strong = new Set<string>();
  const weak = new Set<string>();

  // Emoji are checked on the raw text (normalisation strips them).
  for (const e of MEDICAL_EMOJI) if (e.re.test(text ?? '')) (e.strong ? strong : weak).add(e.label);

  // Normalise → lowercase words with single spaces, then drop disclaimers/allow-phrases.
  const clean = ` ${stripAllowed(normaliseText(stripDisclaimers(foldText(text))))} `.replace(/\s+/g, ' ');
  const words = normaliseWords(clean);

  // Conditions: whole-word/phrase match…
  for (const c of CONDITIONS) if (clean.includes(` ${c} `)) strong.add(c);
  for (const m of EXTRA_MISSPELLINGS) if (clean.includes(` ${m} `)) strong.add(m);
  // …plus misspellings (edit distance 1) on longer terms, and hyphen/space-split words ("ma laria").
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const joined = i + 1 < words.length ? w + words[i + 1] : '';
    for (const c of FUZZY_CONDITIONS) {
      if (w.length >= 6 && w[0] === c[0] && w !== c && editDistance(w, c, 1) <= 1) strong.add(`${c} (as "${w}")`);
      if (joined && joined === c) strong.add(`${c} (as "${w} ${words[i + 1]}")`);
    }
  }

  for (const re of STRONG_CLAIM_PATTERNS) {
    const m = clean.match(re);
    if (m) strong.add(m[0].trim());
  }
  for (const re of WEAK_CLAIM_PATTERNS) {
    const m = clean.match(re);
    if (m) weak.add(m[0].trim());
  }

  const severity: ClaimSeverity = strong.size ? 'strong' : weak.size ? 'weak' : 'none';
  return { ok: severity === 'none', severity, matches: [...strong, ...weak] };
}

// ── Listing decision ───────────────────────────────────────────────────────────

export type ListingDecision = 'publish' | 'review' | 'blocked';

export interface ComplianceResult {
  decision: ListingDecision;
  ingredientFlag: RegulatoryFlag;
  /** The class that actually applies: the stricter of the seller's choice and each herb's class. */
  effectiveClass: PlatformClass;
  /** Every dictionary herb that influenced the decision (explicit + named in text). */
  herbs: string[];
  claim: ClaimScan;
  reasons: string[];
}

export interface ListingInput {
  text: string; // title + description + directions concatenated
  productClass: PlatformClass; // seller-declared — never trusted on its own
  herb?: Herb; // resolved botanical, if the seller picked one
  /** Dictionary to find herbs named in the text. Pass HERBS; omitted = only `herb` is considered. */
  dictionary?: Herb[];
}

const FLAG_RANK: Record<RegulatoryFlag, number> = { green: 0, amber: 1, red: 2 };
const CLASS_RANK: Record<PlatformClass, number> = { A: 0, B: 1, C: 2, D: 3 };

/**
 * Decide whether a listing may publish. Worst outcome wins:
 *   red ingredient (picked OR named in text) -> blocked
 *   strong medicinal claim                    -> blocked
 *   effective class D                         -> blocked at MVP (needs THR/MA + admin)
 *   weak claim word / amber ingredient / class C / class raised / no herb identified -> review
 *   otherwise                                 -> publish
 */
export function evaluateListing(input: ListingInput): ComplianceResult {
  const text = input.text ?? '';
  const claim = scanClaims(text);
  const reasons: string[] = [];

  let decision: ListingDecision = 'publish';
  const escalate = (d: ListingDecision) => {
    const rank = { publish: 0, review: 1, blocked: 2 } as const;
    if (rank[d] > rank[decision]) decision = d;
  };

  // Every herb in play: the one picked + any named in the text.
  const found = new Map<string, Herb>();
  if (input.herb) found.set(input.herb.id, input.herb);
  if (input.dictionary) for (const h of findHerbsInText(text, input.dictionary)) found.set(h.id, h);
  const herbs = [...found.values()];

  // Ingredient flag: worst across all herbs.
  let ingredientFlag: RegulatoryFlag = 'green';
  for (const h of herbs) if (FLAG_RANK[h.regulatoryFlag] > FLAG_RANK[ingredientFlag]) ingredientFlag = h.regulatoryFlag;

  for (const h of herbs.filter((x) => x.regulatoryFlag === 'red')) {
    escalate('blocked');
    reasons.push(`Restricted ingredient (${h.english}) — not listable.${h.note ? ` ${h.note}` : ''}`);
  }
  for (const h of herbs.filter((x) => x.regulatoryFlag === 'amber')) {
    escalate('review');
    reasons.push(`${h.english} requires review${h.note ? ` — ${h.note}` : '.'}`);
  }
  if (herbs.length === 0) {
    escalate('review');
    reasons.push('Ingredient not matched to the botanical dictionary — a reviewer must confirm what this is.');
  }

  // Class: the stricter of what the seller declared and what each herb is.
  let effectiveClass: PlatformClass = input.productClass;
  for (const h of herbs) if (CLASS_RANK[h.platformClass] > CLASS_RANK[effectiveClass]) effectiveClass = h.platformClass;
  if (effectiveClass !== input.productClass) {
    escalate('review');
    reasons.push(`Declared as class ${input.productClass}, but its ingredients make it class ${effectiveClass}.`);
  }

  if (claim.severity === 'strong') {
    escalate('blocked');
    reasons.push(`Medicinal claim detected: “${claim.matches.join('”, “')}”. Health claims are not permitted.`);
  } else if (claim.severity === 'weak') {
    escalate('review');
    reasons.push(`Possible health wording: “${claim.matches.join('”, “')}” — a reviewer will check the context.`);
  }

  if (effectiveClass === 'D') {
    escalate('blocked');
    reasons.push('Class D (herbal medicine) is closed by default — requires MHRA THR/MA + admin approval.');
  } else if (effectiveClass === 'C') {
    escalate('review');
    reasons.push('Cosmetic listing — safety assessment reviewed before first publish.');
  }

  if (decision === 'publish') reasons.push('Passed automated checks.');
  return { decision, ingredientFlag, effectiveClass, herbs: herbs.map((h) => h.id), claim, reasons };
}

// Re-exported for callers that want to pre-clean text for display/search.
export { foldText };
