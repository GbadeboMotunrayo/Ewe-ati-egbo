import type { Herb, RegulatoryFlag } from '../types/botanical';

/**
 * Compliance engine (docs/compliance.md §3–4) as pure, testable logic shared by
 * backend (enforced at publish) and mobile (live seller feedback). AI may *flag*
 * upstream, but these deterministic rules make the block; every block is auditable.
 */

// Phrases that turn a food/cosmetic/botanical listing into an unlicensed medicine
// claim. Deliberately broad — a match means "route to human review", not "guilty".
export const MEDICINAL_CLAIM_PATTERNS: RegExp[] = [
  /\bcures?\b/i,
  /\bcuring\b/i,
  /\btreats?\b/i,
  /\btreatment\b/i,
  /\bheals?\b/i,
  /\bprevents?\b/i,
  /\bremedy\b/i,
  /\bcure[- ]?all\b/i,
  /\bdetox(?:ify|ifies)?\b/i,
  /\bcleanses? (?:the )?(?:blood|system|womb)\b/i,
  // Named conditions
  /\b(malaria|typhoid|diabetes|fibroids?|infection|cancer|ulcer|hypertension|infertility|impotence|staph|hepatitis|arthritis)\b/i,
];

export interface ClaimScan {
  ok: boolean;
  matches: string[];
}

/** Scan seller free-text (title + description + directions) for medicinal claims. */
export function scanClaims(text: string): ClaimScan {
  const matches: string[] = [];
  for (const re of MEDICINAL_CLAIM_PATTERNS) {
    const m = text.match(re);
    if (m) matches.push(m[0].toLowerCase());
  }
  return { ok: matches.length === 0, matches: Array.from(new Set(matches)) };
}

export type ListingDecision = 'publish' | 'review' | 'blocked';

export interface ComplianceResult {
  decision: ListingDecision;
  ingredientFlag: RegulatoryFlag;
  claim: ClaimScan;
  reasons: string[];
}

export interface ListingInput {
  text: string; // title + description + directions concatenated
  productClass: 'A' | 'B' | 'C' | 'D';
  herb?: Herb; // resolved botanical, if known
}

/**
 * Decide whether a listing may publish. Precedence (worst wins):
 *   red ingredient           -> blocked
 *   medicinal claim detected  -> blocked (pending human override)
 *   class D                   -> blocked at MVP (needs THR/MA + admin)
 *   amber ingredient / class C -> review
 *   otherwise                 -> publish
 */
export function evaluateListing(input: ListingInput): ComplianceResult {
  const claim = scanClaims(input.text);
  const ingredientFlag: RegulatoryFlag = input.herb?.regulatoryFlag ?? 'green';
  const reasons: string[] = [];

  let decision: ListingDecision = 'publish';
  const escalate = (d: ListingDecision) => {
    const rank = { publish: 0, review: 1, blocked: 2 } as const;
    if (rank[d] > rank[decision]) decision = d;
  };

  if (ingredientFlag === 'red') {
    escalate('blocked');
    reasons.push(`Restricted ingredient (${input.herb?.english ?? 'unknown'}) — not listable.`);
  } else if (ingredientFlag === 'amber') {
    escalate('review');
    reasons.push(`Ingredient requires review${input.herb?.note ? ` — ${input.herb.note}` : '.'}`);
  }

  if (!claim.ok) {
    escalate('blocked');
    reasons.push(`Medicinal claim detected: “${claim.matches.join('”, “')}”. Health claims are not permitted.`);
  }

  if (input.productClass === 'D') {
    escalate('blocked');
    reasons.push('Class D (herbal medicine) is closed by default — requires MHRA THR/MA + admin approval.');
  } else if (input.productClass === 'C') {
    escalate('review');
    reasons.push('Cosmetic listing — safety assessment reviewed before first publish.');
  }

  if (decision === 'publish') reasons.push('Passed automated checks.');
  return { decision, ingredientFlag, claim, reasons };
}
