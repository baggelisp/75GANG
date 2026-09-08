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

## Constraints

No backend, no database, no network, no accounts. Local storage is the only persistence, and
manual JSON export/import is the only backup path.
