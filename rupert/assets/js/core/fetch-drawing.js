// Original ink-line poses, following Periodicals' small SVG / discrete-pose treatment.
export const FETCH_FRAME_MS = [95, 115, 90, 125, 105, 110];
const legs = [
  'M54 51L42 65L29 69 M62 50L71 61L80 63 M93 49L105 59L115 63 M101 47L98 61L89 68',
  'M54 51L49 61L40 69 M62 50L61 63L67 71 M93 49L106 53L119 54 M101 47L108 59L103 69',
  'M54 51L56 63L65 68 M62 50L49 58L37 62 M93 49L96 63L105 71 M101 47L114 53L126 52',
  'M54 51L64 58L77 61 M62 50L53 63L48 71 M93 49L88 60L77 66 M101 47L110 61L116 68',
  'M54 51L48 64L36 69 M62 50L69 60L80 65 M93 49L105 56L116 59 M101 47L98 62L92 69',
  'M54 51L46 59L34 61 M62 50L63 65L70 72 M93 49L99 62L111 68 M101 47L113 53L122 50',
];
export function fetchDog(frame = 0, carrying = false) {
  const i = Math.max(0, Math.min(5, frame));
  return `<svg viewBox="0 0 150 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="M44 37Q24 ${24+i%3*3} 11 ${17+i%2*5}Q17 30 41 43"/><path d="M43 40Q54 29 82 34L99 31L110 20Q116 13 123 16L130 21L141 23L140 29L130 34L123 36L118 47Q113 52 102 49Q78 56 56 50Q43 52 43 40Z" fill="var(--fetch-fill)"/><path d="M119 18Q111 19 113 34Q118 39 122 28L124 20"/><path d="M130 31L139 30M50 40Q62 35 81 39M70 47L80 48"/><path d="${legs[i]}"/><path d="M127 22h.8" stroke-width="2.8"/><path d="M101 32L119 40" stroke="#C4903E" stroke-width="4"/></g>${carrying ? '<circle cx="140" cy="32" r="6" fill="#929D62" stroke="currentColor" stroke-width="1"/><path d="M136 28q7 3 5 9" fill="none" stroke="#EFE5C9"/>' : ''}</svg>`;
}
export function fetchDock(motif = 'trail') {
  const marks = {water:'M5 8q5-4 10 0t10 0M7 14q5-4 10 0t10 0',trail:'M8 18Q4 3 22 3Q23 16 8 18ZM8 18L20 5',town:'M15 3V22M4 5H24V12H4Z',travel:'M5 6H24V21H5ZM11 6V3H18V6'};
  return `<aside class="fetch-dock" hidden aria-label="Rupert’s tennis ball"><svg class="fetch-motif" viewBox="0 0 30 25" aria-hidden="true"><path d="${marks[motif] || marks.trail}"/></svg><button class="fetch-trigger" type="button" aria-label="Throw the tennis ball for Rupert" title="Throw the ball for Rupert"><span class="tennis-ball" aria-hidden="true"></span></button><span class="fetch-status sr-only" role="status" aria-live="polite"></span></aside><div class="fetch-stage" hidden aria-hidden="true"><div class="fetch-runner"></div><span class="fetch-ball tennis-ball"></span></div>`;
}
