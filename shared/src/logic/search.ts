import type { Herb } from '../types/botanical';
import { foldText, normaliseText } from './text';

/**
 * Multilingual botanical search — the data moat. Matches a query against every
 * name a herb is known by (Yoruba, Igbo/Hausa/other vernacular, English, botanical).
 * Accent- and tone-mark-insensitive: "ewuro", "Ẹ̀wúrọ̀", "onugbu", "bitter leaf"
 * and "Vernonia amygdalina" all resolve to the same herb.
 */

const MIN_QUERY = 2;

/** Every searchable name for a herb (defensive against partial rows from the DB/API). */
export function allNames(h: Herb): string[] {
  return [h.yoruba, ...(h.otherNames ?? []), h.english, h.botanical].filter(
    (n): n is string => typeof n === 'string' && n.length > 0
  );
}

/** Split multi-name fields like "Clove basil / Scent leaf" into separate names. */
function nameVariants(h: Herb): string[] {
  // Only split on spaced slashes ("Clove basil / Scent leaf"); "Fever/malaria decoction"
  // stays one name so "fever" alone doesn't resolve to a formula.
  return allNames(h).flatMap((n) => n.split(/\s+\/\s+/)).map((n) => foldText(n).trim()).filter(Boolean);
}

type Rank = 0 | 1 | 2 | 3; // 0 exact · 1 word-prefix · 2 substring · 3 no match

function rankHerb(h: Herb, q: string): Rank {
  let best: Rank = 3;
  for (const name of nameVariants(h)) {
    if (name === q) return 0;
    if (normaliseText(name).includes(` ${q}`)) best = Math.min(best, 1) as Rank;
    else if (q.length >= 3 && name.includes(q)) best = Math.min(best, 2) as Rank;
  }
  return best;
}

/** Ranked search: exact names first, then word-prefix matches, then substrings (3+ chars). */
export function searchHerbs(query: string | null | undefined, herbs: Herb[]): Herb[] {
  const q = foldText(query ?? '').trim().replace(/\s+/g, ' ');
  if (!q) return herbs;
  if (q.length < MIN_QUERY) return [];
  return herbs
    .map((h, i) => ({ h, i, r: rankHerb(h, q) }))
    .filter((x) => x.r < 3)
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .map((x) => x.h);
}

/**
 * Resolve ONE herb for a term — only when it's unambiguous. Returns undefined
 * rather than guessing, because a wrong herb means a wrong compliance flag.
 */
export function resolveHerb(query: string | null | undefined, herbs: Herb[]): Herb | undefined {
  const q = foldText(query ?? '').trim().replace(/\s+/g, ' ');
  if (q.length < MIN_QUERY) return undefined;
  const exact = herbs.filter((h) => rankHerb(h, q) === 0);
  if (exact.length === 1) return exact[0];
  if (exact.length > 1) return undefined; // e.g. a botanical name shared by leaf & seed entries
  const prefix = herbs.filter((h) => rankHerb(h, q) === 1);
  return prefix.length === 1 ? prefix[0] : undefined;
}

/**
 * Find every dictionary herb *named* in free text (whole-word, accent-insensitive).
 * Used by the compliance engine so a restricted herb can't hide in a description.
 */
export function findHerbsInText(text: string, herbs: Herb[]): Herb[] {
  const hay = normaliseText(text);
  return herbs.filter((h) =>
    nameVariants(h).some((n) => {
      const needle = normaliseText(n);
      // Ignore very short / generic names to avoid accidental matches.
      return needle.trim().length >= 4 && hay.includes(needle);
    })
  );
}
