// Deterministic pre-recovery lifecycle fixture, independent of subsequent genuine publication.
// Production data is never rewritten to make a historical test pass.
export function pendingThursdayFixture(manifest) {
  const fixture = structuredClone(manifest);
  const thursday = fixture.editions.find(e => e.id === '2026-W41-thu');
  thursday.status = 'draft'; thursday.published_at = '2026-10-08T07:00:00-04:00';
  return fixture;
}
