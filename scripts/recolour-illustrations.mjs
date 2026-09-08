// Recolours the unDraw illustrations into the app's own palette.
//
//   node scripts/recolour-illustrations.mjs
//
// unDraw ships its accent as #6c63ff, a purple. The design system allows exactly three accents —
// coral, butter and lavender — and says a fourth colour never enters it, so the accent is remapped
// rather than left to introduce one. The dark line colour is lifted to the app's ink so the
// drawings sit on the near-black ground instead of disappearing into it.
import { readFileSync, writeFileSync } from 'fs';

const FILES = ['welcome', 'how-it-works', 'the-rules', 'your-data'];

// Every value on the right is a token from src/theme/tokens.ts. Nothing else may appear in an
// SVG: the drawings sit on the app's own ground and must be part of its palette, not beside it.
const REMAP = [
  ['#6c63ff', '#EE9080'], // unDraw accent    -> coral
  ['#ed9da0', '#EE9080'], // unDraw skin tone -> coral, rather than a fourth, pinker accent
  ['#3f3d56', '#2E2D33'], // dark furniture   -> raised surface
  ['#2f2e41', '#2E2D33'],
  ['#090814', '#1A1712'], // cold near-black  -> ink, the warm one
  ['#e6e6e6', '#A6ADED'], // pale grey mass   -> lavender
  ['#d6d6e3', '#6E6C76'], // cool blue-greys  -> the warm greys; the palette has no cool grey
  ['#d9d8de', '#9A98A1'],
  ['#f2f2f2', '#9A98A1'],
  ['#cccccc', '#9A98A1'],
  ['#ccc', '#9A98A1'],
  ['#ffffff', '#F4F3F6'], // white            -> the app's own text tone
  ['#fff', '#F4F3F6'],
];

FILES.forEach((name) => {
  const path = `assets/illustrations/${name}.svg`;
  // Word-bounded, so #ccc never eats the first half of #cccccc.
  const recoloured = REMAP.reduce(
    (svg, [from, to]) => svg.replace(new RegExp(`${from}\\b`, 'gi'), to),
    readFileSync(path, 'utf8'),
  );

  writeFileSync(path, recoloured);
  console.log(`recoloured ${name}`);
});
