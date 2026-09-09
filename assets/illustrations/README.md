# Onboarding illustrations

Four SVGs from [unDraw](https://undraw.co), which is free to use for anything, commercial included,
with no attribution required.

| File               | unDraw illustration                      |
| ------------------ | ---------------------------------------- |
| `welcome.svg`      | Morning Workout (`morning-workout_73u9`) |
| `how-it-works.svg` | Completed (`completed_vjc6`)             |
| `your-data.svg`    | Security On (`security-on_3ykb`)         |

These files are the source of truth. They are inlined as strings into
`src/features/onboarding/_illustrations/illustrations.ts` so the app needs no Metro SVG transformer
and no runtime asset fetch.

## The palette

Every colour in these files is a token from `src/theme/tokens.ts`. unDraw ships its own palette —
a purple accent, a pink skin tone, cool blue-greys, white — and none of that belongs in an app
whose whole palette is three accents and a set of warm greys.

`scripts/recolour-illustrations.mjs` does the mapping, and `scripts/inline-illustrations.mjs`
refuses to inline a colour it cannot name, so an un-recoloured SVG is a build error rather than a
fourth colour that reaches the first screen a user ever sees. The inlined strings interpolate
`colors.*` rather than carrying hex values, which keeps `tokens.ts` the only file in the repository
with a colour literal in it.

## Swapping one out

1. Download the replacement from undraw.co as SVG and save it here under the same filename.
2. Recolour it into the app's palette:

   ```bash
   node scripts/recolour-illustrations.mjs
   ```

   If the inliner then complains that a colour is not a token, add the mapping to that script —
   never to the generated file.

3. Re-run the inliner:

   ```bash
   node scripts/inline-illustrations.mjs
   ```

4. `npm run check`.
