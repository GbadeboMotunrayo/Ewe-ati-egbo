/**
 * Text normalisation shared by search and the compliance engine.
 *
 * Think of it as washing the text before inspecting it: whatever disguise a
 * seller (or a Yoruba keyboard) puts on a word — tone marks, full-width letters,
 * Cyrillic look-alikes, zero-width spaces, "c.u.r.e.s" — comes out as plain
 * lowercase ASCII words that the rules can compare reliably.
 */

// Invisible / formatting characters used to split words without showing a gap.
const INVISIBLE = /[­͏؜ᅟᅠ឴឵᠋-᠎​-‏‪-‮⁠-⁯︀-️﻿]/g;

// Common homoglyphs (Cyrillic / Greek letters that look Latin).
const CONFUSABLES: Record<string, string> = {
  а: 'a', в: 'b', е: 'e', ё: 'e', к: 'k', м: 'm', н: 'h', о: 'o', р: 'p', с: 'c', т: 't', у: 'y', х: 'x',
  і: 'i', ї: 'i', ј: 'j', ѕ: 's', ԁ: 'd', ԛ: 'q', ԝ: 'w', ӏ: 'l', һ: 'h', ɡ: 'g',
  α: 'a', β: 'b', ε: 'e', η: 'n', ι: 'i', κ: 'k', ν: 'v', ο: 'o', ρ: 'p', τ: 't', υ: 'u', χ: 'x', ω: 'w',
};

// Digits/symbols used as letters ("cur3s", "m4laria"). Only applied inside
// tokens that also contain letters, so "100g" and "2024" stay untouched.
const LEET: Record<string, string> = { '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', $: 's', '!': 'i' };

/** "cur3s"/"m4laria" yes; "100g"/"4x"/"2kg" no — needs ≥2 letters and more letters than digits. */
function looksLeet(t: string): boolean {
  const letters = (t.match(/[a-z]/g) ?? []).length;
  const others = (t.match(/[0-9@$!]/g) ?? []).length;
  return others > 0 && letters >= 2 && letters > others;
}

/** Lowercase, strip accents/tone marks, remove invisible chars, map look-alikes. */
export function foldText(input: string): string {
  const s = (input ?? '')
    .normalize('NFKC') // full-width -> ASCII, ligatures split
    .replace(INVISIBLE, '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '') // tone marks & under-dots: Ẹ̀wúrọ̀ -> Ewuro
    .toLowerCase();
  let out = '';
  for (const ch of s) out += CONFUSABLES[ch] ?? ch;
  return out;
}

/**
 * Normalise to space-separated plain words:
 *  - folds accents/look-alikes,
 *  - maps leetspeak inside mixed tokens,
 *  - re-joins letter-by-letter spellings ("c u r e s", "c.u.r.e.s" -> "cures"),
 *  - re-joins single-hyphen splits ("ma-laria" stays searchable as "malaria" via `joined`).
 */
export function normaliseWords(input: string): string[] {
  const folded = foldText(input);
  // Tokenise on anything that isn't a letter/digit/leet symbol.
  const raw = folded.split(/[^a-z0-9@$!]+/).filter(Boolean);
  const tokens = raw
    .map((t) => (looksLeet(t) ? [...t].map((c) => LEET[c] ?? c).join('') : t))
    .map((t) => t.replace(/[@$!]/g, ''))
    .filter(Boolean);

  // Collapse runs of 3+ single letters into one word: "c u r e s" -> "cures".
  const words: string[] = [];
  let run: string[] = [];
  const flush = () => {
    if (run.length >= 3) words.push(run.join(''));
    else words.push(...run);
    run = [];
  };
  for (const t of tokens) {
    if (t.length === 1 && /[a-z]/.test(t)) run.push(t);
    else {
      flush();
      words.push(t);
    }
  }
  flush();
  return words;
}

/** Space-joined normalised text, padded so `includes(' word ')` is a whole-word test. */
export function normaliseText(input: string): string {
  return ` ${normaliseWords(input).join(' ')} `;
}

/** Levenshtein distance, capped for speed (returns max+1 once exceeded). */
export function editDistance(a: string, b: string, max = 2): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}
