# Architecture — pure core, adapters at the edges

Binding. `tests/unit/architecture.test.ts` (created in feature 01) parses every module under `src/`
and `app/` and fails the build on any import that crosses a boundary the wrong way. Never mark it
skipped.

## Layout

```
app/                                  Expo Router — routes only, no logic
  (tabs)/
    _layout.tsx                       tab bar (Today, Progress, Journal, Profile)
    index.tsx                         → renders TodayScreen
    progress.tsx  journal.tsx  profile.tsx
  onboarding/
    _layout.tsx  index.tsx  rules.tsx  start-date.tsx
  habit/[habitId].tsx                 → renders HabitDetailScreen
  settings/
    index.tsx  notifications.tsx  data.tsx
  _layout.tsx                         root: theme provider, storage provider, splash

src/
  domain/                             PURE. no React, no expo-*, no storage, no Date.now()
    habits.ts                         the 11 habit definitions (hardcoded constant)
    habitIds.ts                       the HabitId union + HabitIdEnum
    targets.ts                        target types: boolean/litres/pages/minutes/sessions/windows/measurement
    completion.ts                     decideHabitIsComplete, calculateDayCompletion
    streaks.ts                        calculateCurrentStreak, calculateLongestStreak
    challenge.ts                      calculateCurrentDay(startDate, today), challenge status
    timers.ts                         calculateElapsedMinutes(startedAt, now), window completion
    achievements.ts                   badge rules
    export/
      schema.ts                       the export envelope type + SCHEMA_VERSION
      validateImport.ts               returns a Result, never throws at the caller
    types.ts                          DayRecord, HabitRecord, JournalEntry, Profile, Settings

  storage/
    ports/
      keyValueStore.ts                get/set/remove/clear — the ONLY storage interface
      fileStore.ts                    photo write/read/delete/exists
      clock.ts                        now(): Date
    adapters/
      asyncStorageKeyValueStore.ts    the only importer of @react-native-async-storage/async-storage
      expoFileStore.ts                the only importer of expo-file-system
      systemClock.ts                  the only caller of new Date()
    repositories/
      challengeRepository.ts          reads/writes @75gang/challenge
      dayRepository.ts                reads/writes @75gang/days
      journalRepository.ts            reads/writes @75gang/journal
      profileRepository.ts            reads/writes @75gang/profile
      settingsRepository.ts           reads/writes @75gang/settings
    storageKeys.ts                    the five key constants, nothing else
    bootstrap.ts                      composition root — the ONLY module constructing adapters

  features/
    today/
      TodayScreen.tsx                 one screen component per file
      _components/…                   TodayHeaderCard, HabitTileGrid, HabitTile, …
      _hooks/useToday.ts
    progress/  journal/  profile/  onboarding/  habit-detail/  settings/

  components/                         shared across 2+ features only
    charts/
      ProgressRings.tsx               the three concentric rings (react-native-svg)
      TrendLine.tsx                   the coral weight-trend line (react-native-svg)
  theme/
    tokens.ts                         the palette from design-system.md — the only colour literals
    typography.ts                     the type roles; em→pt letter-spacing conversion lives here
    fonts.ts                          @expo-google-fonts Archivo + Manrope loading
    spacing.ts  radii.ts
  i18n/
    index.ts  locales/en.ts  locales/el.ts
  utils/
    DateUtility.ts                    all date formatting — never inline toLocaleDateString
```

## Import rules (enforced by the architecture test)

| Layer | May import | Must never import |
|---|---|---|
| `src/domain/**` | `src/domain/**` only | React, `react-native`, `expo-*`, `src/storage/**`, `src/features/**`, `Date.now()`, `new Date()` |
| `src/storage/ports/**` | types from `src/domain/**` | any adapter, any concrete library |
| `src/storage/adapters/**` | its own library + `src/storage/ports/**` | `src/features/**`, another adapter |
| `src/storage/repositories/**` | `src/storage/ports/**`, `src/domain/**` | an adapter directly, `src/features/**` |
| `src/features/**` | `src/domain/**`, `src/storage/repositories/**`, `src/components/**`, `src/theme/**` | `src/storage/adapters/**`, `@react-native-async-storage/*`, `expo-file-system` |
| `src/components/**` | React, React Native, a render library, `src/domain/**`, `src/theme/**` | `src/storage/**`, `src/features/**` |
| `app/**` | `src/features/**`, `src/theme/**`, and `src/storage/bootstrap` in `_layout.tsx` only | any other `src/storage/**`, `src/domain/**` directly |

Anything under `app/` is a route: it imports one screen component and renders it. Logic in a route
file is a review CRITICAL.

## Why the core is pure

Three of the trickiest requirements in the spec are pure functions, and they are where bugs cost
the user their streak:

- **Elapsed time from a timestamp.** The 1 h and 3 h detox windows and both 45 min workouts must
  keep elapsing with the app closed. `calculateElapsedMinutes(startedAt, now)` takes `now` as an
  argument, so a test can advance three hours instantly instead of waiting.
- **Day derivation.** The current day is *never stored* — it is `calculateCurrentDay(startDate,
  today)`. Test it across a DST boundary, a month end, and a leap day without touching a device.
- **Streaks.** A perfect day is all 11 complete; the streak is consecutive perfect days. Pure input,
  pure output, exhaustively parametrized.

If one of these ever needs a mock to test, the boundary is in the wrong place.

## Composition root

`src/storage/bootstrap.ts` is the only module that constructs an adapter. It builds the
repositories once and hands them to a React context in `app/_layout.tsx`. Nothing else calls
`new AsyncStorageKeyValueStore()`.

This is the single exception to the `app/**` row above: the route layer may import
`src/storage/bootstrap` and nothing else under `src/storage`. The architecture test encodes the
exemption by exact path, so `@/storage/adapters/...` from a route still fails.

Tests build the same repositories over an in-memory `KeyValueStore` — that is the whole point of
the port.

## Adding a habit tracker

New tracking behaviour is a new entry in a registry keyed by `targetType`, never a new `if
(habitId === 'water')` branch. One registry, one component per variant, resolved by the
discriminator. Scattered `=== 'literal'` checks are a house-style violation and a review finding.
