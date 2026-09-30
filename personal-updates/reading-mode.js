/* Runs synchronously in the head, before publication styles paint. */
(function () {
  'use strict';
  var key = 'periodicals:session-mode', manual = null, timer;
  try { manual = sessionStorage.getItem(key); } catch (e) {}
  if (manual !== 'day' && manual !== 'night') manual = null;
  function current() { var h = new Date().getHours(); return h >= 7 && h < 19 ? 'day' : 'night'; }
  function apply(mode) {
    document.documentElement.setAttribute('data-mode', mode);
    document.dispatchEvent(new CustomEvent('periodicals:modechange', {detail: mode}));
  }
  function refresh() {
    clearTimeout(timer);
    if (manual) { apply(manual); return; }
    apply(current());
    var now = new Date(), next = new Date(now);
    var h = now.getHours();
    next.setHours(h < 7 ? 7 : h < 19 ? 19 : 7, 0, 0, 0);
    if (h >= 19) next.setDate(next.getDate() + 1);
    // Recheck at least every minute for device clock/timezone changes.
    timer = setTimeout(refresh, Math.min(next - now, 60000));
  }
  window.PeriodicalsMode = {choose: function (mode) {
    if (mode !== 'day' && mode !== 'night') return;
    manual = mode;
    try { sessionStorage.setItem(key, mode); } catch (e) {}
    refresh();
  }};
  addEventListener('pageshow', refresh);
  addEventListener('focus', refresh);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) refresh(); });
  refresh();
})();
