# 75 G-ANG

**75 Days. 11 Rules. A Better You.**

An offline-first mobile habit tracker for the 75 Hard Gang Way challenge: 11 daily discipline
rules, 75 days, no account and no server. Every byte the app owns lives on the device.

The 11 rules are in `Docs/rules.jpeg`; the product spec is `Docs/75-hard-gang-way-mvp.md`.

## Install

```bash
npm install
```

Requires Node 20+. No native build step — the app runs in Expo Go and on web.

## Run

```bash
npm run web        # browser, the target for the /live review
npm run ios        # iOS simulator or Expo Go
npm run android    # Android emulator
```

## Verify

```bash
npm run check      # tsc --noEmit && eslint . && jest
```

This single command is the gate. Nothing ships unless it is fully green.

## Architecture

Pure core, adapters at the edges. Full rules in `.claude/rules/architecture.md`.

- **`app/`** — Expo Router routes. A route renders one screen component and holds no logic.
- **`src/features/<screen>/`** — screens, their components and hooks.
- **`src/domain/`** — pure logic: habit completion, streaks, day derivation, timer maths. No React,
  no `expo-*`, no storage, and never reads the clock — `now` is always injected.
- **`src/storage/`** — `ports/` define the interfaces, `adapters/` implement them against
  AsyncStorage and the file system, `repositories/` sit on top. `bootstrap.ts` is the only module
  that constructs an adapter, which is what keeps a swap to MMKV a one-file change.
- **`tests/unit/architecture.test.ts`** parses every module under `src/` and `app/` and fails the
  build if an import crosses a boundary the wrong way.

## Where things are

- **Onboarding** picks one of three challenges — Easy (6 rules), Medium (9) or Hard (11, the rules
  in `Docs/rules.jpeg`) — and a start date.
- **Today** shows the day, the rings, the streak and the rules of your own challenge. Tapping a
  simple rule completes it; tapping a measured one opens its detail screen.
- **Habit detail** holds the controls each rule needs: counters for water and reading, timers for
  the skill, spirituality and connection rules, two sessions for the workouts, the morning detox
  windows and the daily weigh-in.
- **Progress** is the whole challenge: the stats, the seventy-five days laid out as a real
  Monday-first calendar, and the weight trend. Tapping a day opens what was recorded on it, and
  arrows walk from there to the day before or after.
- **Journal** is one reflection a day, saved without leaving the screen.
- **Profile** is who you are and where the challenge stands, and the way through to **Settings** —
  your name, the reminder times, and the two ways to start over. **Restart** begins day 1 again on
  the same challenge; **erase** clears everything recorded and sends you back to choose a new one.
  Both name exactly what is deleted before they touch anything, and both keep your name and your
  settings.
- **Export and import** live in Settings. Export writes the five storage keys under the spec's
  header to `75gang-backup-YYYY-MM-DD.json` and opens the share sheet; progress photos stay on the
  phone. Import validates the whole file before a single byte is written, describes the backup, and
  only then replaces everything — and puts your data back if the write fails halfway.
- **Credits** sit at the foot of Settings, not on the onboarding slides the artwork appears on:
  unDraw for the illustrations, AntDesign for the icons, Archivo and Manrope for the type. None of
  them require attribution.
- **Reminders** are two local notifications a day at the times in Settings, scheduled with
  `expo-notifications` and no server anywhere. The evening one carries the live completed count, so
  it is cancelled and rebuilt after every tap; reset, a finished challenge and the off switch all
  clear the queue through the same path.
- **Badges** sit on Profile: the five from the spec, computed from the day records rather than
  stored, so a reset really does take them away. Earned and unearned differ by mark, weight and
  words, never by colour alone.
- **The Perfect Day celebration** is the one real animation. It fires on the _transition_ to all
  rules met, so it happens once and never again on reopening the app, it lets taps through to the
  screen underneath, and it degrades to a static banner under reduce motion.

## Screenshots

`Docs/screenshots.md` — all eighteen screens, captured from the app running for real, not mockups.
Regenerate with `node Docs/screenshots/capture.mjs` while `npm run web` is up on port 8090.

## Constraints

No backend, no database, no network, no accounts. Local storage is the only persistence, and
manual JSON export/import is the only backup path.
