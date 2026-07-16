/**
 * Resizes raw iPhone screenshots from screenshots-inbox/ into App Store
 * Connect's 6.7" size (1290×2796) in store/screenshots/, named and numbered
 * in the order they should appear on the store page.
 *
 *   node scripts/process-screenshots.js
 *
 * Update MAPPING when reshooting — order matters: the first image is the one
 * shoppers see in search results.
 */
const sharp = require('sharp');
const path = require('path');

const IN = path.join(__dirname, '..', 'screenshots-inbox');
const OUT = path.join(__dirname, '..', 'store', 'screenshots');

const TARGET = { width: 1290, height: 2796 }; // 6.7" iPhone, portrait

const MAPPING = [
  { src: 'IMG_9041.PNG', out: 'tend-1-home.png' },
  { src: 'IMG_9040.PNG', out: 'tend-2-routines.png' },
  { src: 'IMG_9043.PNG', out: 'tend-3-shop.png' },
  { src: 'IMG_9042.PNG', out: 'tend-4-journal.png' },
  { src: 'IMG_9044.PNG', out: 'tend-5-profile.png' },
];

(async () => {
  for (const { src, out } of MAPPING) {
    await sharp(path.join(IN, src))
      .resize(TARGET.width, TARGET.height, { fit: 'cover' })
      .png()
      .toFile(path.join(OUT, out));
    console.log(out);
  }
})();
