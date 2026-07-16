/**
 * Generates all app icons from one SVG design: a paw print with a heart-shaped
 * main pad, in the app's warm field-journal palette (cream paper, persimmon,
 * warm ink outlines — same style as the in-app pet art).
 *
 *   node scripts/generate-icons.js
 *
 * Outputs into assets/images/: icon.png (iOS, opaque), splash-icon.png,
 * favicon.png, and the three Android adaptive-icon layers.
 */
const sharp = require('sharp');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets', 'images');

const CREAM = '#FAF3E7';
const CREAM_DEEP = '#F1E3C8';
const PERSIMMON = '#E4572E';
const PERSIMMON_DEEP = '#C6431D';
const INK = '#4B3826';

/** The paw itself, drawn in a 1024 box, centered. `mono` = flat single color. */
const paw = (fill, outline, strokeWidth) => `
  <g transform="rotate(-6 512 512)">
    <!-- outer toes -->
    <ellipse cx="296" cy="424" rx="74" ry="98" transform="rotate(-26 296 424)"
      fill="${fill}" ${outline ? `stroke="${outline}" stroke-width="${strokeWidth}"` : ''}/>
    <ellipse cx="728" cy="424" rx="74" ry="98" transform="rotate(26 728 424)"
      fill="${fill}" ${outline ? `stroke="${outline}" stroke-width="${strokeWidth}"` : ''}/>
    <!-- inner toes -->
    <ellipse cx="424" cy="292" rx="72" ry="104" transform="rotate(-7 424 292)"
      fill="${fill}" ${outline ? `stroke="${outline}" stroke-width="${strokeWidth}"` : ''}/>
    <ellipse cx="600" cy="292" rx="72" ry="104" transform="rotate(7 600 292)"
      fill="${fill}" ${outline ? `stroke="${outline}" stroke-width="${strokeWidth}"` : ''}/>
    <!-- heart-shaped main pad -->
    <path d="M512 830
             C 378 748, 318 640, 366 548
             C 402 480, 494 478, 512 556
             C 530 478, 622 480, 658 548
             C 706 640, 646 748, 512 830 Z"
      fill="${fill}" ${outline ? `stroke="${outline}" stroke-width="${strokeWidth}" stroke-linejoin="round"` : ''}/>
  </g>`;

/** Full iOS icon: soft cream gradient paper + persimmon paw with ink outline. */
const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <radialGradient id="paper" cx="50%" cy="38%" r="80%">
      <stop offset="0%" stop-color="${CREAM}"/>
      <stop offset="100%" stop-color="${CREAM_DEEP}"/>
    </radialGradient>
    <linearGradient id="pad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${PERSIMMON}"/>
      <stop offset="100%" stop-color="${PERSIMMON_DEEP}"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#paper)"/>
  ${paw('url(#pad)', INK, 14)}
</svg>`;

/** Transparent paw only (splash + favicon + Android foreground). */
const pawOnly = (size, fill, outline) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024">
  ${paw(fill, outline, outline ? 14 : 0)}
</svg>`;

/** Android foreground needs the art inside the middle ~66% safe zone. */
const androidForeground = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <g transform="translate(512 512) scale(0.62) translate(-512 -512)">
    ${paw(PERSIMMON, INK, 14)}
  </g>
</svg>`;

const androidMonochrome = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <g transform="translate(512 512) scale(0.62) translate(-512 -512)">
    ${paw('#FFFFFF', null, 0)}
  </g>
</svg>`;

const render = (svg, file, size) =>
  sharp(Buffer.from(svg)).resize(size, size).png().toFile(path.join(OUT, file));

(async () => {
  // iOS marketing icon must be opaque — the gradient rect covers the canvas.
  await render(iconSvg, 'icon.png', 1024);
  await render(pawOnly(512, PERSIMMON, INK), 'splash-icon.png', 512);
  await render(pawOnly(96, PERSIMMON, INK), 'favicon.png', 96);
  await render(androidForeground, 'android-icon-foreground.png', 1024);
  await sharp({ create: { width: 1024, height: 1024, channels: 4, background: CREAM } })
    .png()
    .toFile(path.join(OUT, 'android-icon-background.png'));
  await render(androidMonochrome, 'android-icon-monochrome.png', 1024);
  console.log('icons written to', OUT);
})();
