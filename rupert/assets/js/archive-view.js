import { matchesOption } from './core/options.js';
export function setupArchive() {
  const archive = document.querySelector('.archive');
  const form = archive?.querySelector('.archive-filters');
  if (!form) return;
  form.hidden = false;
  const run = () => {
    const filters = Object.fromEntries(new FormData(form));
    const active = Object.entries(filters).some(([key, value]) => value.trim() && !(key === 'crowd' && value === 'any'));
    let count = 0;
    archive.querySelectorAll('.arch-week').forEach(week => {
      let shown = false;
      week.querySelectorAll('.arch-ed:not(.is-missing)').forEach(edition => {
        let hit = false;
        edition.querySelectorAll('[data-option]').forEach(row => {
          const match = matchesOption(JSON.parse(row.dataset.option), filters);
          row.hidden = !match; hit ||= match; if (match) count++;
        });
        edition.hidden = !hit; shown ||= hit;
      });
      week.hidden = !shown;
      week.querySelectorAll('.is-missing').forEach(row => { row.hidden = active; });
    });
    archive.querySelectorAll('.arch-year').forEach(year => {
      let row = year.nextElementSibling, shown = false;
      while (row && !row.classList.contains('arch-year')) { if (row.classList.contains('arch-week') && !row.hidden) shown = true; row = row.nextElementSibling; }
      year.hidden = !shown;
    });
    archive.querySelector('.archive-count').textContent = `${count} ${count === 1 ? 'option' : 'options'}${active ? ' match' : ' to return to'}.`;
    archive.querySelector('.archive-empty').hidden = count !== 0;
  };
  form.addEventListener('submit', e => e.preventDefault());
  form.addEventListener('input', run);
  form.addEventListener('reset', () => setTimeout(run, 0));
  run();
}
