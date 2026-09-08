# 75 G-ANG — Claude Instructions

**75 Hard Gang Way** is an offline-first mobile habit tracker: 11 daily discipline rules, 75 days,
no account and no server. The full product spec is `Docs/75-hard-gang-way-mvp.md` — read it before
any work. `Docs/rules.jpeg` is the source of truth for the 11 rules. For the visual design the
authority runs: `Docs/mockups/home-screen.html` (the built mockup — exact colours, radii, type
scale, ring geometry) → `Docs/mockup.png` → the spec's "Design Direction" section. When they
disagree, the more specific source wins and the spec gets fixed in the same PR.

Tagline: **75 Days. 11 Rules. A Better You.**

## Hard constraints (from the MVP spec — violations fail the feature)

- **No backend, no database, no network.** No Supabase, no Firebase, no API client, no `fetch` to
  anything. Every byte the app owns lives on the device. A feature that adds a network dependency
  is rejected, not negotiated.
- **No auth.** No login, no sign up, no accounts, no email, no password, no `userId` anywhere in
  the data model. The app opens straight into the challenge.
- **Local storage is the only persistence.** The five keys in `Docs/75-hard-gang-way-mvp.md`
  ("Storage Keys") are the whole schema. Photos are files in the app's own documents directory;
  day records store the *path*, never the image.
- **Timers persist a start timestamp, never a tick counter.** A 3-hour no-content window must still
  elapse correctly with the app force-quit. Any timer that counts ticks in memory is a defect.
- **Write on every habit interaction.** A force-quit must never lose progress.
- **Export/import is the only backup path.** JSON only, full replace on import, validated before a
  single byte is written. Photos are deliberately excluded from the export.
- **Three challenges, one set of rules.** `Docs/rules.jpeg` is the **Hard** challenge and is never
  softened. Easy (6 rules) and Medium (9 rules) are strict subsets of it at lighter targets, defined
  in `src/domain/modes.ts`. A perfect day is all the rules of the user's own challenge. The mode is
  stored on the challenge record and fixed for its duration.
- **Dark mode is the default and the only theme that has to look right** in the MVP.
- **Post-MVP features do not leak in early:** no auth, no cloud sync, no social feed, no friends,
  no leaderboards, no AI coach, no Apple Health, no subscriptions. If a backlog item seems to need
  one, stop and ask.

## Tech stack

Expo (managed) · React Native · TypeScript `strict` · Expo Router (file-based routes for the four
tabs) · `@react-native-async-storage/async-storage` behind our own port · `expo-file-system` ·
`expo-sharing` · `expo-document-picker` · `expo-image-picker` · `expo-notifications` ·
`jest-expo` + `@testing-library/react-native` · ESLint (`eslint-config-expo`) + Prettier.

Single verification gate — everything must be green before anything ships:

```bash
npm run check      # tsc --noEmit && eslint . && jest
npm run web        # expo start --web   (the target for /live review)
npm run ios        # expo start --ios   (device-only checks: camera, notifications, share sheet)
```

`npm run check` is created by backlog feature 01. Never add a script that skips a leg of it.

## Architecture — pure core, adapters at the edges (binding)

Full rules and the folder layout: `.claude/rules/architecture.md`. The essentials:

```
app/ (Expo Router)  ─►  src/features/<screen>/  ─►  src/domain/   (pure: no React, no I/O)
                                  │                      ▲
                                  ▼                      │ implements
                          src/storage/ports  ◄── src/storage/adapters (AsyncStorage, FileSystem)
```

- **`src/domain/` is pure.** No React, no `AsyncStorage`, no `expo-*`, no `Date.now()` reached for
  directly. It owns the 11 habit definitions, day completion + percentage, streak and perfect-day
  calculation, timer elapsed-from-timestamp math, achievement rules, and export-schema validation.
  This is the part TDD actually pays for, and it is exhaustively unit-tested.
- **Time is injected.** Anything that needs "now" takes it as an argument or through a `Clock`
  port. A domain function that calls `Date.now()` is untestable and is a defect.
- **One storage port.** `KeyValueStore` in `src/storage/ports`. The AsyncStorage adapter is the
  only module importing `@react-native-async-storage/async-storage`, so `react-native-mmkv` can
  replace it later without touching a line of domain code (the spec anticipates this).
- **Screens never talk to storage directly.** They go through a feature hook that goes through a
  repository that holds the port.
- **The 11 habits are a hardcoded constant**, not stored data. `src/domain/habits.ts`.

## Definition of done (every feature, every PR)

1. Tests written first (`superpowers:test-driven-development`) — failing test, minimal code, green,
   refactor. Never implementation-first with tests backfilled.
2. `npm run check` fully green. Fix, don't skip. A justified exception is commented in the code and
   named in the PR body.
3. `reviewer` agent returns **PASS**, or WARNINGS you have fixed or consciously deferred in the PR
   body. CRITICAL never ships.
4. `/live` run recorded: what was exercised in the browser, screenshots, zero console errors, and an
   explicit `device-only: not verified` list for anything react-native-web cannot honour.
5. House style holds — `vspathonis-code-style` plus `.claude/rules/react-native-style.md`.
6. Design system holds — `.claude/rules/design-system.md`. Text on a filled accent tile is `ink`,
   never white. The palette is three accents — coral, butter, lavender — and a fourth colour never
   enters it. Coral means done or active. No shadows anywhere.
7. `Docs/backlog.md` updated in the same PR. `README.md` too for anything user-visible.
8. One feature, one branch, one PR. Nothing else rides along.

## How work is organised

- The feature list is `Docs/backlog.md`, worked **in order** unless you say otherwise.
- `/ship-next` runs the whole cycle for one feature and **stops** with an open PR: analyse → TDD →
  `npm run check` → `/review` → `/live` → commit → push → PR → report. It never starts the next one.
- **PRs are stacked.** Work does not wait for a merge. Feature `NN` branches from the tip of the
  stack — the newest `feat/*` branch whose PR is still open — and its PR is opened with
  `--base <that branch>`, so each PR's diff contains only its own feature. When nothing is open, the
  base is `origin/main`. Details in `.claude/rules/git-workflow.md`.
- `/restack` repairs the stack after an out-of-order or squash merge.
- `/review` and `/live` are the standalone review and browser steps.
- Conventions live in `.claude/rules/` — architecture, react-native-style, design-system, testing,
  git-workflow. Read the relevant one before writing code, not after.

## Code style

`vspathonis-code-style` (installed globally at `~/.claude/skills/`) is **binding** here. Its
description names another project and it is written for Next.js — ignore that; the rules are the
user's personal house style and apply to all React work, including React Native.
`.claude/rules/react-native-style.md` records the deltas: `StyleSheet` instead of SCSS, no server
components, Expo Router folder rules, theme tokens instead of colour literals.

The non-negotiables you will get pulled up on: one component per file, arrow-function components,
no inline `??` / `||` / ternaries in JSX, no `.map()` in a template (extract a `*List`), no prop
spread, `ComponentNameProps` types, named `decide*` / `is*` helpers instead of inline expressions,
guard clauses and early returns over nested conditionals, `null` over `undefined`, no magic
strings or numbers, and every user-facing string through the translation layer.

## Git identity — this is a PERSONAL repo

This machine has several GitHub identities and **the wrong one is active by default.**

- GitHub user `baggelisp`, remote `https://github.com/baggelisp/75GANG.git`.
- `gh auth status` must show **`baggelisp`** as the active account before any PR command. It
  currently defaults to the work account `vspathonis-ip`.
- If the active account is not `baggelisp`: **stop and tell the user** to run
  `gh auth switch --user baggelisp`. Never open a PR on this repo from the work account.
- Never merge a PR yourself, never push to `main`, never force-push. The user merges on GitHub.

## Language

The user writes and reads Greek in chat. Code, comments, commit messages, PR bodies, README and
docs stay in English. App UI strings go through the translation layer from day one.
