import type { Herb } from '../types/botanical';

/**
 * Multilingual botanical search — the data moat. Matches a query against every
 * name a herb is known by (Yoruba, Igbo/Hausa/other vernacular, English, botanical),
 * case-insensitively. "ewuro", "onugbu", "bitter leaf" and "Vernonia amygdalina" all
 * resolve to the same herb.
 */
export function searchHerbs(query: string, herbs: Herb[]): Herb[] {
  const q = query.trim().toLowerCase();
  if (!q) return herbs;
  return herbs.filter((h) => allNames(h).some((n) => n.toLowerCase().includes(q)));
}

/** Every searchable name for a herb. */
export function allNames(h: Herb): string[] {
  return [h.yoruba, ...h.otherNames, h.english, h.botanical];
}

/** Resolve a single best-match herb for a vernacular term, or undefined. */
export function resolveHerb(query: string, herbs: Herb[]): Herb | undefined {
  const q = query.trim().toLowerCase();
  return (
    herbs.find((h) => allNames(h).some((n) => n.toLowerCase() === q)) ??
    searchHerbs(q, herbs)[0]
  );
}
