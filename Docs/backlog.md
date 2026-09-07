# 75 G-ANG — Backlog

The feature list `/ship-next` works from, **in order**. One item = one branch = one stacked PR.

Source of truth for scope: `Docs/75-hard-gang-way-mvp.md`. For anything visual the authority is
`Docs/mockups/home-screen.html`, then `Docs/mockup.png`, then the spec's "Design Direction". If an
item here contradicts those, they win and this file gets corrected in the same PR.

**Known spec conflict (2026-09-07):** section 3 of the spec still describes the 11 habits as
"interactive cards" in a two-column grid, which was the old design. The Design Direction and the
mockup both show a **tappable checklist with coral checkboxes**. The backlog follows the checklist —
it is the newer and more specific source. Fix section 3 of the spec in the feature 07 PR.

## Status legend

| Mark | Meaning |
|---|---|
| `[ ]` | Not started |
| `[~]` | In an open PR (the stack base for whatever comes next) |
| `[x]` | Merged to `main` |

Each item carries its PR number once opened: `[~] 04 — Challenge domain — PR #7`.

## Ordering rationale

The pure domain lands before any screen. Every hard problem in this app — day derivation, streaks,
completion thresholds, elapsed-from-timestamp timers — is a pure function, and building those first
means the UI features are assembly rather than logic. Features 01-04 produce almost no visible app
and are the reason the rest go quickly.

---

## [~] 01 — Scaffold and the verification gate — PR #1

Expo + TypeScript project, Expo Router, and the single command everything else is judged by.

**Acceptance**
- `npx create-expo-app` with the TypeScript template; Expo Router configured; the app boots to a
  placeholder on iOS and on web.
- `tsconfig.json` with `strict: true` and path alias `@/*` → `src/*`.
- ESLint (`eslint-config-expo`) + Prettier; jest-expo + `@testing-library/react-native` wired.
- Scripts: `check` (`tsc --noEmit && eslint . && jest`), `web`, `ios`, `android`, `test`, `lint`.
- `tests/unit/architecture.test.ts` exists and enforces the import table in
  `.claude/rules/architecture.md`. It passes on an empty `src/`.
- `README.md`: install, run, the architecture in five lines.
- `.gitignore` covers `node_modules`, `.expo`, `dist`, `*.log`, `.DS_Store`.

**Tests first** — the architecture test is the first failing test in the repo: assert that a
fixture module importing `expo-file-system` from `src/domain/` is rejected.

**device-only:** none. **Live review:** `LIVE: n/a` — placeholder screen only.

---

## [~] 02 — Theme, fonts and base primitives — PR #2

The design system from `.claude/rules/design-system.md` as code, plus the shared primitives every
screen needs. `Docs/mockups/home-screen.html` is the authority on every number here — read its CSS
rather than approximating.

**Acceptance**
- `src/theme/tokens.ts` — the warm near-black surfaces, three text tones, `ink`, and the three
  accents (coral, butter, lavender). The only file in the repo containing a colour literal.
- `src/theme/typography.ts` — the eleven type roles from the design system, with `em` letter
  spacing converted to points once, here. Every numeric role carries
  `fontVariant: ['tabular-nums']`.
- `src/theme/fonts.ts` — Archivo (600/700/800) and Manrope (400/500/600/700) via
  `@expo-google-fonts`, with the splash screen held until they load. No flash of a fallback face.
- `src/theme/spacing.ts`, `src/theme/radii.ts` (card/tile 24, rule row 14, checkbox 7, pill 99).
- `src/components/` primitives: `Screen` (safe area, warm near-black, edge to edge), `Card`,
  `AccentTile` (accent fill as a prop, `ink` content), `SectionLabel`, `BigNumber` (Archivo,
  tabular), `Pill`, `HairlineRow`, `PrimaryButton`, `SecondaryButton`.
- `src/components/charts/ProgressRings.tsx` — the three concentric rings via `react-native-svg`:
  radii 52/38/24, stroke 12, round caps, rotated -90, each over a full `hairline` track, progress
  as a `strokeDasharray` arc. One combined `accessibilityLabel` for all three values.
- Guards that fail the build on a colour literal outside `tokens.ts`, on a shadow or `elevation`
  anywhere, and on a hardcoded font size.
- Dark only. Nothing anticipates a light theme.

**New dependencies:** `react-native-svg`, `@expo-google-fonts/archivo`, `@expo-google-fonts/manrope`,
`expo-font`, `expo-splash-screen`.

**Tests first** — `AccentTile` renders its content in `ink` on each of the three accents; the rings
produce the right arc length at 0%, part-way and 100%, and never exceed a full circle when a value
passes its target; a value of 0 renders a track and no arc; the guards reject a component
containing a `#`, a `shadowOpacity`, or a raw `fontSize`.

**Live review:** the primitives on a scratch screen, screenshotted beside the mockup at 396px.
**device-only:** none.

**Known deviation (web):** the render is held for the fonts on native only, where the splash screen
covers the wait. On web there is no splash and holding the tree exports an empty page under static
rendering, so the first paint uses the fallback face and swaps to Archivo/Manrope when they arrive.
A `/live` screenshot may catch that reflow — it is expected, not a regression.

---

## [~] 03 — Storage ports, adapters and repositories — PR #3

The persistence layer, with the swap to MMKV kept open exactly as the spec asks.

**Acceptance**
- `src/storage/ports/`: `KeyValueStore`, `FileStore`, `Clock`.
- `src/storage/adapters/`: `asyncStorageKeyValueStore` (the only importer of AsyncStorage),
  `expoFileStore`, `systemClock`.
- `src/storage/storageKeys.ts` — exactly the five keys from the spec.
- Repositories for profile, challenge, days, journal, settings. Each reads through the port,
  validates the shape on read, and returns `null` for absent — never a fabricated default.
- `src/storage/bootstrap.ts` — the composition root, the only module constructing an adapter.
- An in-memory `KeyValueStore` test double in `tests/`.

**Tests first** — a repository over the in-memory store: absent key → `null`; corrupt JSON →
a typed read error, not a crash; round-trip write and read; a partial object never overwrites a
complete record.

**device-only:** the real AsyncStorage/FileSystem adapters (covered by their port contract tests).

---

## [~] 04 — Challenge, completion and streak domain — PR #4

The pure core. No React, no storage, `now` injected everywhere.

**Acceptance**
- `src/domain/habits.ts` — the 11 habits as a hardcoded constant with id, name, description, icon,
  target type and target value, matching the spec's Habit IDs exactly.
- `src/domain/challenge.ts` — `calculateCurrentDay(startDate, today)`, challenge status. The
  current day is **never stored**.
- `src/domain/completion.ts` — per-habit completion by target type, day completion count and
  percentage, perfect day.
- `src/domain/streaks.ts` — current and longest streak from the day records.
- Every function is pure and takes `now`/`today` as an argument.

**Deferred to feature 05:** habit `name` and `description` are user-facing strings and live in the
translation layer keyed by habit id, not on the habit definition. `src/i18n/` does not exist yet,
so they are absent rather than relocated — land the `en`/`el` keys with feature 05.

**Tests first** — the full boundary table from `.claude/rules/testing.md`: 2.9 vs 3.0 L, 14 vs 15
pages, one vs two 45-minute sessions, one vs both detox windows, weight-without-photo; day 1,
day 75, day 76, a future start date, a DST transition, a leap day; an empty history, a gap day
(not perfect), a broken streak, current vs longest diverging.

**device-only:** none. **Live review:** `LIVE: n/a` — no UI yet.

---

## [~] 05 — i18n scaffold — PR #5

**Acceptance**
- `src/i18n/` with an `en` locale and the hook every component uses. Greek locale stubbed with the
  original rule wording from the spec kept verbatim.
- No em dashes in translation strings.
- An eslint rule or test that fails on a hardcoded user-facing string in a component.

**Tests first** — a component with a hardcoded string fails the guard; the hook returns the `en`
value; a missing key is reported loudly in development rather than rendering blank.

**device-only:** none.

---

## [~] 06 — Onboarding — PR #6

**Acceptance**
- Welcome → challenge explanation → the 11 rules → start-date picker → optional name → Start.
- No sign up, no login, no email. The name is optional and stored locally.
- Starting writes `@75gang/profile` and `@75gang/challenge`, then routes to Today on day 1.
- A returning user with a challenge already stored never sees onboarding.
- The start date can be today or in the past; a future date is rejected with a clear message.

**Tests first** — an existing challenge skips onboarding; Start writes both keys before navigating;
a future start date is rejected; the name is genuinely optional.

**Live review:** first launch, and relaunch with a challenge already stored.
**device-only:** none.

---

## [~] 07 — Challenge modes: Easy, Medium and Hard — PR #7 — PR #7

Three challenges instead of one. The rules in `Docs/rules.jpeg` are the **Hard** challenge and are
never softened; Easy (6 rules) and Medium (9 rules) are strict subsets at lighter targets.

**Acceptance**
- `src/domain/modes.ts` defines the three, with per-mode habit lists and target overrides.
- Completion and perfect-day are scored against the user's own challenge, not always eleven.
- The challenge record stores its mode; a record without one is rejected.
- Onboarding offers the three and defaults to Hard.
- Every habit of a lighter challenge appears in a harder one at an equal or harder target.

**Tests first** — the same day scores differently in each mode; a habit from a harder challenge
never inflates an easier day; the ladder invariant holds.

**device-only:** none.

---

## [~] 08 — Today screen — PR #8

The home screen from `Docs/mockups/home-screen.html`, top to bottom. Build it against that file
open in a second browser tab.

**Acceptance**
- **Header** — date and day kicker, `HEY, {NAME}` greeting in uppercase Archivo, avatar with a
  butter status dot. A user with no name set gets a greeting that still reads correctly.
- **Today card** — the three rings from feature 02 (habits / workouts / water) with the legend
  beside them: label in the ring's accent, value with a unit suffix, fraction on the right. A
  percentage-complete pill in the card header.
- **Two filled tiles side by side** — Streak in butter, Weight in lavender. Content in `ink`.
- **Challenge card** — perfect days and days remaining as two big numbers.
- **The rules of the user's own challenge** — a tappable checklist, one row per rule, separated by
  hairlines, with a coral checkbox carrying an `ink` check mark when done. The whole row is the tap
  target. Six rows on Easy, nine on Medium, eleven on Hard (this bullet predates feature 07).
- **Tab bar** — Today, Progress, Journal, Profile. The active tab is a coral pill.
- The screen derives everything from the day record and the challenge. Nothing displayed is read
  from a stored duplicate.
- Empty state on day 1 with nothing done; and the 11/11 state.

Note: the weight trend card from the mockup lands in feature 13, once there is weight history to
draw. Until then the Today screen does not show it.

**Tests first** — the header numbers and ring fractions for a seeded day; a rule row tap writes
before it resolves and marks the box; a rule with a target navigates to its detail instead of
completing; the checklist renders 11 rows in spec order; the greeting with and without a name.

**Live review:** day 1 empty, mid-challenge partial, and 11/11 — each screenshotted beside the
mockup.
**device-only:** none.

---

## [~] 09 — Tap habits and the day record write path — PR #9

The three pure-tap habits (`no-alcohol`, `diet`, `no-devices-bed`) and the shared write path.

**Acceptance**
- Toggle on and off; the day record updates and `completedHabits`, `completionPercentage` and
  `perfectDay` are **recomputed** and persisted, never edited directly.
- The diet habit surfaces the 22:00 cut-off reminder from the spec.
- Two rapid taps on different habits cannot lose each other's write.
- A write failure surfaces an error and does not leave the UI showing a false success.

**Tests first** — the recompute-then-persist projection; a concurrent write on two habits keeps
both; a rejected write rolls the UI back.

**Live review:** tap, reload, state survives.
**device-only:** none.

---

## [~] 10 — Water and reading counters

**Acceptance**
- Water: `0 / 3 Litres`, +250 ml / +500 ml / +1 L, auto-completes at 3 L.
- Reading: `N / 15 Pages`, +1 / +5, auto-completes at 15.
- Both persist on every increment. Values above target are kept, not clamped away.
- A decrement or undo path so a mis-tap is recoverable.

**Tests first** — 2.9 L incomplete, 3.0 complete; 14 pages incomplete, 15 complete; fifty rapid
increments all land; an increment above target does not break the percentage.

**Live review:** increment, reload, value survives.
**device-only:** none.

---

## [ ] 11 — Timers: workouts, skill, spirituality, connection

**Acceptance**
- `calculateElapsedMinutes(startedAt, now)` from feature 04 is the only source of elapsed time.
  Only `startedAt` (and accumulated paused minutes) is persisted — never a tick counter.
- Workouts: two independent 45-minute timers, each with an optional Outdoor toggle, plus a manual
  "mark done" for a forgotten timer. Complete only when both sessions reach 45 minutes.
- Skill 45 min, spirituality 15 min, connection 15 min.
- Start / pause / resume. A timer running while the app is closed still elapses.
- The screen's interval only forces a re-render; it is cleared on unmount.

**Tests first** — elapsed across a simulated restart; `startedAt` in the future; a timer that
completed while closed; pause and resume preserving accumulated minutes; two sessions of 44 minutes
incomplete, two of 45 complete; one 90-minute session is **not** two workouts.

**Live review:** start a timer, reload the page, elapsed time continued.
**device-only:** true background behaviour — but the logic is fully unit-tested; say so.

---

## [ ] 12 — Morning detox

**Acceptance**
- "I woke up" starts both windows at once from a single `wokeUpAt` timestamp.
- 1 hour phone-free and 3 hours no-content run in parallel; the habit completes when both finish.
- An honesty timer — the app blocks nothing.
- Both windows keep elapsing with the app closed.

**Tests first** — one window done and the other at 179 minutes is incomplete; both done is complete;
`wokeUpAt` in the future; a window completed while closed credited on reopen; "I woke up" pressed
twice does not restart a running window.

**Live review:** wake up, reload, both windows still counting.
**device-only:** background elapse (logic unit-tested).

---

## [ ] 13 — Weigh-in and progress photo

**Acceptance**
- Weight in kg to one decimal, with `-` / `+` and direct entry.
- Take photo or choose from library; saved to the app's own directory as `photos/YYYY-MM-DD.jpg`.
- The day record stores the **path**, never the image.
- Completes only when both weight and photo are present.
- A missing photo file degrades to a placeholder; it never throws and never blocks the record.
- Permission denied and picker cancelled are both handled with a clear state.

**Tests first** — weight without photo incomplete and vice versa; a weight of 0 or negative
rejected; three decimals rounded to one; a missing file renders the placeholder; a cancelled
picker leaves the record untouched.

**Live review:** the file-input fallback and the weight input only.
**device-only:** **camera, photo library, real file paths, permissions.** Verify on device.

---

## [ ] 14 — Progress screen and the 75-day grid

**Acceptance**
- Current day, days completed, days remaining, current streak, best streak.
- A 75-cell grid built from the stored day records, marking completed, today, and future.
- Tapping a past day opens its read-only detail.
- **Weight trend card** — `src/components/charts/TrendLine.tsx`: a coral line across the challenge
  so far, `react-native-svg`, stroke 2.4 with round caps, a hollow coral marker on the latest
  point, `textTertiary` axis labels. Built from the weigh-in values in the day records.
- The trend degrades honestly: no weigh-ins yet shows an empty state, one weigh-in shows the point
  and no line, and gaps in the history are gaps in the line rather than interpolated.
- `FlatList`, not `.map()` in a `ScrollView`.
- Empty state on day 1 with no history.

**Tests first** — the grid at day 1, day 40 with gaps, and day 75; a day with no record renders as
incomplete, not as an error; tapping a future cell does nothing; the trend path with zero, one and
many points, and with a gap in the middle; the y-axis range for a flat series (all the same weight)
does not divide by zero.

**Live review:** day 1 empty, day 40 seeded with gaps, day 75 complete.
**device-only:** none.

---

## [ ] 15 — Journal

**Acceptance**
- One entry per day: how was your day, what went well, what was difficult, what to improve.
- Keyed by date, stored locally, saved without leaving the screen.
- Editing an existing entry; an empty entry is not saved as a blank record.
- History list of past entries.

**Tests first** — round-trip save and load; an all-empty entry is not persisted; editing replaces
rather than appending; a very long entry is handled.

**Live review:** write, reload, entry survives; empty entry not saved.
**device-only:** none.

---

## [ ] 16 — Profile, settings and reset/restart

**Acceptance**
- Name, start date, current day, current and best streak.
- Settings: edit profile, notification preferences (UI only until 17), dark mode, reset, restart.
- **Reset** clears `challenge`, `days` and `journal`, deletes the photos directory, and keeps
  profile and settings — exactly as the spec states.
- **Restart** reinitialises the challenge from a new start date.
- Both confirm first, and the confirm text says exactly what is lost.

**Tests first** — reset clears the three keys and keeps the other two; restart writes a new
`startDate` and an empty days map; cancelling a confirm changes nothing.

**Live review:** run reset from a seeded mid-challenge state and confirm what remains.
**device-only:** photo directory deletion.

---

## [ ] 17 — Export and import

**Acceptance**
- Export writes the five keys wrapped in the spec's header to
  `75gang-backup-YYYY-MM-DD.json` and opens the native share sheet. Photos are deliberately
  excluded. Read-only — nothing local changes.
- Import opens the document picker (JSON only), **validates before writing a single byte**, then
  fully replaces local data behind an explicit confirmation, and reloads to Today on the correct day.
- Rejections, each with its own reason code: not valid JSON; `app !== "75gang"`; `schemaVersion`
  newer than supported; missing or invalid `challenge.startDate`.
- Unknown extra fields are **ignored, not rejected**, so older exports keep working.
- Photo paths pointing at missing files degrade to a placeholder.

**Tests first** — round-trip equality; every rejection rule by reason code; unknown fields ignored;
a failed import leaves the existing data completely intact; a missing photo path degrades.

**Live review:** validation and the confirm dialog, via the file-input fallback.
**device-only:** **native share sheet and document picker.** Verify on device.

---

## [ ] 18 — Local notifications

**Acceptance**
- Morning and evening reminders at the times in settings, scheduled locally with
  `expo-notifications`. No push server.
- The evening reminder carries the live completed count.
- Enable/disable, and permission denied handled without breaking settings.
- Reminders are cancelled when the challenge is reset or completed.

**Tests first** — the scheduled payload for a given day and count; a reminder time already past
today schedules for tomorrow; disabling cancels everything; reset cancels everything.

**Live review:** the settings UI only.
**device-only:** **all scheduling and delivery.** Verify on device.

---

## [ ] 19 — Achievements

**Acceptance**
- The five MVP badges: 7 Day Warrior, Perfect Week, 30 Day Discipline, Halfway There (day 38),
  75 Hard Complete.
- Derived from the day records — badge state is computed, not stored as a separate truth.
- Shown on the Profile screen; earned and unearned states are distinguishable without colour.

**Tests first** — each badge at its exact threshold and one below; Perfect Week needs seven perfect
days, not seven days; badges recompute correctly after a reset.

**Live review:** seeded histories at each threshold.
**device-only:** none.

---

## [ ] 20 — Perfect Day celebration

**Acceptance**
- Fires when the 11th habit of the day completes, once per day, not on every subsequent render.
- Respects `AccessibilityInfo.isReduceMotionEnabled()` with a static fallback.
- Does not block interaction or delay the write.

**Tests first** — fires at 11/11 and not at 10/11; does not re-fire on revisit; reduce-motion path
renders the static state.

**Live review:** complete the 11th habit from a seeded 10/11 state.
**device-only:** haptics, if added.

---

## Out of scope for the MVP

Not in this backlog and not to be added without an explicit decision: authentication, any backend
or database, cloud sync and multi-device, a social feed, friends, chat, leaderboards, an AI coach,
Apple Health or wearables, community groups, subscriptions, mood tracking, weekly reports, advanced
analytics, custom reminders, merging two exports, partial import, export encryption, and exporting
the progress photos.
