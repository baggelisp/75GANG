# Testing

- **Framework:** `jest-expo` preset + `@testing-library/react-native`. Run with `npm test`;
  `npm run check` runs it as its last leg.
- **TDD is mandatory.** `superpowers:test-driven-development`: write the failing test, watch it
  fail, write the minimum code, watch it pass, refactor. Never implementation-first with tests
  backfilled. The `/ship-next` cycle enforces this and the reviewer checks the commit for it.

## Layout mirrors the source

```
tests/
  unit/
    domain/          completion, streaks, challenge, timers, achievements, export
    storage/         repositories over an in-memory KeyValueStore
    features/        screens and components via @testing-library/react-native
    architecture.test.ts
  fixtures/          real day records, export files, edge-case challenges
```

`tests/unit/domain/` imports **nothing** from `src/storage` or `src/features`. If a domain test
needs a mock, the boundary is wrong — fix the boundary, not the test.

## Rules

- **No real storage in unit tests.** Never `@react-native-async-storage/async-storage`, never
  `expo-file-system`. Repositories are tested over an in-memory `KeyValueStore` that implements the
  port. A unit test that touches the device is a bug.
- **Never mock time with a global.** Domain functions take `now` as an argument — pass a fixed
  `Date`. `jest.useFakeTimers()` is for interval-driven components only, never for domain logic.
- **Fixtures are files, not inline blobs.** Day records, export envelopes and malformed imports
  live in `tests/fixtures/` and are named after what they demonstrate
  (`perfect_day.json`, `export_schema_version_2.json`, `day_with_missing_photo.json`).
- **Assert real values, not "did not throw."** `expect(result.completedHabits).toBe(7)`, never
  `expect(() => …).not.toThrow()` as the whole test.
- **Parametrize with `it.each`** instead of copy-pasting. Table IDs read as sentences.
- **No logic in a test body.** No `if`, no loop building expectations.
- **Test naming:** `<unit> <condition> <expected>` —
  `calculateCurrentStreak breaks on a non-perfect day and restarts at one`.
- **Components are tested by what the user sees.** Query by accessible role and label, never by
  `testID` where a label exists, and never by reaching into state.

## Coverage that is actually required

**Every habit's completion rule** gets a positive and a near-miss negative:

- water at 2.9 L is incomplete, at 3.0 L complete;
- reading at 14 pages incomplete, 15 complete;
- workouts with one 60-minute session incomplete, with two 45-minute sessions complete;
- workouts with two sessions of 44 minutes incomplete;
- morning detox with the phone window done but the content window at 179 minutes incomplete;
- weigh-in with a weight but no photo incomplete, and with a photo but no weight incomplete.

**Challenge day derivation:** day 1 on the start date, day 75 on the last date, day 76 → completed,
a start date in the future, a DST transition inside the window, and a leap day.

**Timers:** elapsed across an app restart (only `startedAt` stored), a `startedAt` in the future,
a window that finished while the app was closed, and a paused workout resumed the next hour.

**Streaks:** an empty history, a single perfect day, a broken streak, a streak that ends today,
current vs longest diverging, and a gap day with no record at all (which is not perfect).

**Export/import:** round-trip equality; and every rejection rule from the spec fails with its own
reason code — not valid JSON, `app !== "75gang"`, `schemaVersion` newer than supported, missing or
invalid `challenge.startDate`. Unknown extra fields are **ignored, not rejected** — that has its own
test. Photo paths pointing at missing files degrade to a placeholder rather than failing the import.

**Persistence:** every habit interaction writes immediately — a test asserts the store was written
before the interaction resolves.

## Assert on reason codes, not messages

`expect(result.error.reason).toBe(ImportErrorEnum.SCHEMA_VERSION_TOO_NEW)`, never a substring of a
user-facing string. Messages are translated and will change.

## The architecture test

`tests/unit/architecture.test.ts` parses every module under `src/` and `app/` and asserts the
import table in `.claude/rules/architecture.md`. It runs in `npm run check` and is never skipped.
It is the only thing standing between a pure domain and someone importing `AsyncStorage` into
`streaks.ts` at 1am.

## Style applies to tests

Descriptive names, no single-letter variables, no abbreviations, `const` over `let`, no magic
numbers (`WATER_TARGET_LITRES`, not `3`). Tests are read more often than they are written.
