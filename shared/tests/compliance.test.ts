import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateListing, scanClaims } from '../src/logic/compliance';
import { searchHerbs, resolveHerb } from '../src/logic/search';
import { HERBS } from '../src/data/herbs';

test('multilingual search resolves vernacular, English and botanical names', () => {
  const byYoruba = resolveHerb('ewuro', HERBS);
  const byIgbo = resolveHerb('onugbu', HERBS);
  const byEnglish = resolveHerb('bitter leaf', HERBS);
  const byLatin = resolveHerb('Vernonia amygdalina', HERBS);
  assert.equal(byYoruba?.id, 'ewuro');
  assert.equal(byIgbo?.id, 'ewuro');
  assert.equal(byEnglish?.id, 'ewuro');
  assert.equal(byLatin?.id, 'ewuro');
});

test('search matches partial vernacular tokens', () => {
  assert.ok(searchHerbs('prekese', HERBS).some((h) => h.id === 'aidan'));
});

test('clean culinary listing publishes', () => {
  const r = evaluateListing({ text: 'Dried bitter leaf for soup. Wash before cooking.', productClass: 'A', herb: resolveHerb('ewuro', HERBS) });
  assert.equal(r.decision, 'publish');
});

test('medicinal claim is blocked', () => {
  const r = evaluateListing({ text: 'This agbo cures malaria and treats fibroids.', productClass: 'A' });
  assert.equal(r.decision, 'blocked');
  assert.ok(r.claim.matches.includes('cures'));
});

test('red-flagged ingredient is blocked even with clean copy', () => {
  const r = evaluateListing({ text: 'Traditional seeds.', productClass: 'A', herb: resolveHerb('oju ologbo', HERBS) });
  assert.equal(r.decision, 'blocked');
});

test('class D is closed by default', () => {
  const r = evaluateListing({ text: 'Herbal preparation.', productClass: 'D' });
  assert.equal(r.decision, 'blocked');
});

test('scanClaims passes neutral text', () => {
  assert.equal(scanClaims('Aromatic fruit used in West African cooking.').ok, true);
});
