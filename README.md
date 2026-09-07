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
  the skill, spirituality and connection rules, two sessions for the workouts, and the morning
  detox windows. The weigh-in arrives in a later feature.

## Screenshots

`Docs/screenshots.md` — captured from the app running for real, not mockups. Regenerate them with
`node Docs/screenshots/capture.mjs` while `npm run web` is up on port 8090.

## Constraints

No backend, no database, no network, no accounts. Local storage is the only persistence, and
manual JSON export/import is the only backup path.
