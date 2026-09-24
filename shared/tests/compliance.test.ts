import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateListing, scanClaims } from '../src/logic/compliance';
import { searchHerbs, resolveHerb, findHerbsInText } from '../src/logic/search';
import { normaliseText } from '../src/logic/text';
import { HERBS } from '../src/data/herbs';

const herb = (id: string) => HERBS.find((h) => h.id === id)!;
const evalA = (text: string, extra: Partial<Parameters<typeof evaluateListing>[0]> = {}) =>
  evaluateListing({ text, productClass: 'A', dictionary: HERBS, ...extra });

// ── Search ─────────────────────────────────────────────────────────────────────

test('multilingual search resolves vernacular, English and botanical names', () => {
  for (const q of ['ewuro', 'onugbu', 'bitter leaf', 'Vernonia amygdalina']) assert.equal(resolveHerb(q, HERBS)?.id, 'ewuro', q);
});

test('search is accent/tone-mark insensitive (correct Yoruba spelling works)', () => {
  assert.equal(resolveHerb('ewúro', HERBS)?.id, 'ewuro');
  assert.equal(resolveHerb('Ẹ̀wúrọ̀', HERBS)?.id, 'ewuro');
  assert.ok(searchHerbs('EWÚRO', HERBS).some((h) => h.id === 'ewuro'));
});

test('search matches partial vernacular tokens', () => {
  assert.ok(searchHerbs('prekese', HERBS).some((h) => h.id === 'aidan'));
});

test('resolveHerb never guesses on ambiguous or empty input', () => {
  assert.equal(resolveHerb('', HERBS), undefined);
  assert.equal(resolveHerb('   ', HERBS), undefined);
  assert.equal(resolveHerb('Piper guineense', HERBS), undefined); // leaf + seed entries
  assert.equal(resolveHerb('tea', HERBS)?.id === 'soko', false); // was: substring of "argentea"
  assert.equal(resolveHerb('kola nut', HERBS)?.id, 'obi');
});

test('one-letter queries do not return the whole catalogue; exact matches rank first', () => {
  assert.equal(searchHerbs('a', HERBS).length, 0);
  assert.equal(searchHerbs('neem', HERBS)[0]?.id, 'dongoyaro');
});

test('search survives missing fields and null queries', () => {
  const partial = [{ ...herb('ewuro'), english: undefined as unknown as string, otherNames: undefined as unknown as string[] }];
  assert.doesNotThrow(() => searchHerbs('ewuro', partial));
  assert.doesNotThrow(() => searchHerbs(undefined, HERBS));
  assert.doesNotThrow(() => searchHerbs(null, HERBS));
});

test('findHerbsInText spots restricted herbs named only in free text', () => {
  const ids = findHerbsInText('Oju ologbo seeds (Abrus precatorius), 100g', HERBS).map((h) => h.id);
  assert.ok(ids.includes('oju-ologbo'));
  assert.deepEqual(findHerbsInText('Fresh lemongrass bundle', HERBS).map((h) => h.id).includes('agbo-iba'), false);
});

// ── Normalisation ──────────────────────────────────────────────────────────────

test('normalisation washes common disguises', () => {
  assert.equal(normaliseText('сures fevеr').trim(), 'cures fever'); // Cyrillic с, е
  assert.equal(normaliseText('ｃｕｒｅｓ').trim(), 'cures'); // full-width
  assert.equal(normaliseText('cur​es').trim(), 'cures'); // zero-width space
  assert.equal(normaliseText('c.u.r.e.s').trim(), 'cures');
  assert.equal(normaliseText('c u r e s').trim(), 'cures');
  assert.equal(normaliseText('cur3s m4laria').trim(), 'cures malaria');
  assert.equal(normaliseText('100g pack').trim(), '100g pack'); // pure numbers untouched
});

// ── Claim bypasses (all must be caught) ────────────────────────────────────────

const MUST_BLOCK = [
  'This agbo cures malaria and treats fibroids.',
  'This agbo cur​es malar​ia', 'This agbo сures fevеr', 'ｃｕｒｅｓ ｍａｌａｒｉａ', 'cu­res mal­aria',
  'ćures everything', 'cur3s m4laria', 'c u r e s everything', 'good for ma-laria',
  'cured my cousin', 'healing tea', 'gets rid of fever', 'kills germs fast', 'boosts fertility',
  'fertility booster', 'for barrenness', 'lowers blood sugar', 'reduces blood pressure', 'for high BP',
  'for weak erection', 'for STD', 'for gonorrhoea', 'for covid', 'antibacterial soap', 'anti-malarial leaf',
  'antimalarial blend', 'for piles', 'womb cleanser', 'cleanse your womb', 'blood cleanser', 'flush toxins',
  'for typhod', 'for tyfoid', 'for maleria', 'o n wo iba', 'agbo iba ni', 'e fi n wo aisan', 'for jedi jedi',
  'ogwu iba', 'na medicine for iba', 'good for sugar', 'for belle wahala', '💊 for 🦟',
  'Not intended to cure anything but it cures malaria', // disclaimer can't hide a claim
];
for (const text of MUST_BLOCK) {
  test(`blocks claim: ${JSON.stringify(text)}`, () => {
    assert.equal(evalA(text, { herb: herb('ewuro') }).decision, 'blocked');
  });
}

// ── False positives (must NOT be blocked) ──────────────────────────────────────

const MUST_NOT_BLOCK = [
  'Sweet treats for the whole family',
  'Great for dog treats',
  'Zip bag prevents moisture',
  'Resealable pouch prevents spillage',
  'Not intended to diagnose, treat, cure or prevent any disease.',
  'This product does not treat any infection.',
  'Home remedy style pepper soup spice',
  'Cancer Research UK charity partner',
  'Secure pouch, dried in the sun',
  'Pickled pepper blend',
  'Great substitute for sugar in drinks',
  'Digestion aids are sold separately',
];
for (const text of MUST_NOT_BLOCK) {
  test(`does not block: ${JSON.stringify(text)}`, () => {
    assert.notEqual(evalA(`Dried bitter leaf. ${text}`).decision, 'blocked');
  });
}

test('a lone weak verb goes to review, not block', () => {
  const r = evalA('Dried bitter leaf. A traditional detox blend.');
  assert.equal(r.decision, 'review');
  assert.equal(r.claim.severity, 'weak');
});

// ── Ingredient + class logic ───────────────────────────────────────────────────

test('clean culinary listing publishes', () => {
  assert.equal(evalA('Dried bitter leaf for soup. Wash before cooking.', { herb: herb('ewuro') }).decision, 'publish');
});

test('red herb named only in text is blocked (no herbId needed)', () => {
  assert.equal(evalA('Oju ologbo seeds (Abrus precatorius), 100g').decision, 'blocked');
  assert.equal(evalA('Agbo jedi-jedi mix', { herb: herb('ewuro') }).decision, 'blocked');
});

test('red-flagged ingredient is blocked even with clean copy', () => {
  assert.equal(evalA('Traditional seeds.', { herb: resolveHerb('oju ologbo', HERBS) }).decision, 'blocked');
});

test('unidentified ingredient goes to review, never silently green', () => {
  const r = evalA('Mystery powder, 50g');
  assert.equal(r.decision, 'review');
  assert.equal(r.herbs.length, 0);
});

test('seller cannot downgrade the class of a herb', () => {
  const cosmetic = evalA('Shea butter tub', { herb: herb('ori') });
  assert.equal(cosmetic.effectiveClass, 'C');
  assert.equal(cosmetic.decision, 'review');
  const medicine = evalA('Brimstone tree root', { herb: herb('oruwo') });
  assert.equal(medicine.effectiveClass, 'D');
  assert.equal(medicine.decision, 'blocked');
});

test('class D is closed by default', () => {
  assert.equal(evaluateListing({ text: 'Herbal preparation.', productClass: 'D' }).decision, 'blocked');
});

test('safety-flag corrections are in force (pending adviser)', () => {
  assert.equal(herb('ebolo').regulatoryFlag, 'amber');
  assert.equal(herb('rere').regulatoryFlag, 'red');
  assert.equal(herb('obi').regulatoryFlag, 'amber');
});

test('scanClaims passes neutral text', () => {
  assert.equal(scanClaims('Aromatic fruit used in West African cooking.').ok, true);
});

test('scanning is fast on large input (no ReDoS)', () => {
  const big = 'aromatic leaf for soup. '.repeat(20_000);
  const t = Date.now();
  scanClaims(big);
  assert.ok(Date.now() - t < 2000, `took ${Date.now() - t}ms`);
});
