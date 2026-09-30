// Hand-drawn American Labrador: lean body, drop ear, deep chest and tapering otter tail.
export function labrador(pose = 'stand') {
  const paths = {
    stand: 'M15 34Q6 31 3 21Q15 28 24 25Q49 18 75 26L83 16Q85 7 96 10L101 18L114 22L112 29L99 31L92 42L89 62L81 62L80 42Q64 46 45 40L37 60L29 60L31 39Z M94 13Q82 13 87 29L96 26 M45 40L47 59L41 59 M80 42L76 58L70 58',
    walk: 'M18 31Q6 29 3 19Q17 25 25 23Q53 18 76 25L84 14Q86 7 97 10L103 18L116 22L114 29L99 30L91 40L102 57L95 61L80 43Q60 45 44 39L24 57L18 53L31 37Z M95 13Q83 13 87 28L96 25 M43 39L54 60L47 61 M81 43L69 59L63 57',
    sit: 'M27 59Q10 61 5 48Q19 56 29 48L35 33L55 24L60 13Q62 4 74 8L80 16L93 20L91 27L78 30L71 40L75 61L65 61L60 42L56 62L27 62Z M73 11Q60 12 64 27L74 24 M35 42Q48 38 51 52L43 61',
  };
  return `<svg class="lab-outline lab-${pose}" viewBox="0 0 120 70" aria-hidden="true" focusable="false"><path d="${paths[pose] || paths.stand}" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
