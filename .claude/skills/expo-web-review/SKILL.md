---
name: expo-web-review
description: Use when running the /live review for 75 G-ANG — how to start Expo for web, drive it through the Playwright MCP, seed and reset local storage, verify the dark design system on screen, and report honestly about what react-native-web cannot verify.
---

# Live Review — Expo Web under Playwright

Mechanics for reviewing a feature in a **real running app** before its PR opens. The target is
`expo start --web` (react-native-web) driven through the **Playwright MCP**. For *what* to check,
the acceptance criteria of the backlog item are the list; this skill is about *how* to run it.

## Start the app

```bash
npm run web        # expo start --web, serves on http://localhost:8081
```

Start it in the background and wait for the "Web is waiting on http://localhost:8081" line before
navigating. If the port is taken, Expo picks another and prints it — read the real port from the
output, never assume 8081.

Stop the server when the review ends. A stray Metro bundler holding the port is the most common
cause of a confusing second run.

## Drive it

```
browser_navigate      → http://localhost:8081
browser_snapshot      → prefer this over screenshots for reading state and getting stable refs
browser_take_screenshot → for the PR body and for anything visual (colour, layout, contrast)
browser_console_messages → after every meaningful interaction
```

Prefer `browser_snapshot` for asserting text and state — it is cheaper and gives refs you can act
on. Take screenshots for the record and for anything the accessibility tree cannot show you, which
is most of the design system.

## Compare against the mockup, don't compare against memory

`Docs/mockups/home-screen.html` is a real HTML file, so Playwright can open it directly:

```
browser_tabs (new)  → file:///Users/langaware/_Code/personal/75GANG/Docs/mockups/home-screen.html
```

Screenshot the mockup and the running app at the same viewport width (the mockup's phone frame is
396px wide) and put the two images side by side in the report. For any screen the mockup covers,
this is the review — a difference you can see beats a rule you half-remember.

The mockup is also the authority on exact values. Rather than eyeballing a radius or a letter
spacing, read the CSS:

```bash
grep -n 'border-radius\|font-size\|letter-spacing\|stroke-width' Docs/mockups/home-screen.html
```

Two things in that file are **presentation chrome, not the app**, and must not be copied into the
product: the dotted paper background with its light/dark `--paper-*` tokens, and the drop shadow
under the phone frame. The app itself has one dark world and no shadows.

## Storage — this app has no login, so state IS the fixture

There is no account to sign into. The app's entire state is five `localStorage` keys under the web
build (`@75gang/profile`, `challenge`, `days`, `journal`, `settings`). That makes seeding trivial
and it is how you reach day 40 without waiting forty days.

```js
// browser_evaluate — reset to a first launch
Object.keys(localStorage).filter(k => k.startsWith('@75gang/')).forEach(k => localStorage.removeItem(k))
```

```js
// browser_evaluate — jump to a mid-challenge state
localStorage.setItem('@75gang/challenge', JSON.stringify({
  startDate: '2026-07-30', totalDays: 75, currentStreak: 12, longestStreak: 12, status: 'active'
}))
```

Reload after seeding. Seed from a fixture in `tests/fixtures/` where one exists, so the browser
review and the unit tests are looking at the same data rather than two hand-typed approximations.

**Always review a feature from at least two states:** a first launch (nothing stored) and a
realistic mid-challenge state. Most bugs in this app are empty-state bugs or "day 40" bugs, and the
happy path in the middle hides both.

## What to verify after every interaction

- **The write happened.** Read the key back with `browser_evaluate` and check the field actually
  changed. The MVP requires a write on every habit interaction — a UI that updates without
  persisting is exactly the bug this step exists to catch. Then reload the page and confirm the
  state survived.
- **No console errors.** `browser_console_messages`. Zero is the bar. A React key warning, an
  `act()` warning, or a "cannot update state on unmounted component" all count as errors here.
- **The design system holds.** Screenshot it and look:
  - Text and icons on every filled accent tile are near-black `ink`, never white. Most common
    violation by a distance.
  - Only three accents are on screen: coral, butter, lavender. A green, blue or red anywhere means
    a fourth colour got in — usually through a form's success or error state.
  - Coral appears only on done or active things.
  - The warm near-black runs edge to edge. No white flash on load, no light-mode leak.
  - The number is the visual hero on each tile, in Archivo, with tabular figures that do not shift
    width as a timer counts.
  - No shadow under any card.
- **The state is legible without colour.** A completed tile carries a check mark or label, not just
  a colour change.

## What react-native-web CANNOT verify

Say this plainly in the report; never let a web pass imply a full pass.

| Area | Web behaviour | Verify how |
|---|---|---|
| Camera / progress photo | `expo-image-picker` falls back to a file input; no camera | iOS Simulator or a device |
| Local notifications | `expo-notifications` is a no-op or throws on web | Device only |
| Native share sheet | `expo-sharing` unavailable; export falls back to a download | Device only |
| Document picker (import) | Becomes a plain file input; native picker untested | Device only |
| File system paths | `expo-file-system` differs; photo paths are not real device paths | Device only |
| Background timers | The browser tab throttles; the app is never truly force-quit | Device, or a unit test on `calculateElapsedMinutes` |
| Native gestures, haptics, safe areas | Approximate or absent | Device only |

For anything on this list, the honest report is: the **logic** was verified by unit tests, the
**UI** was verified in the browser, and the **native path** was not verified. Put that in the PR
body under `device-only, NOT verified in web`.

The one that matters most: a timer's correctness is a pure function of `startedAt` and `now`, and
that *is* fully covered by unit tests. So a throttled browser tab is not a gap in the logic — say
so, rather than implying the timer is unverified.

## When you find a bug

Fix it now rather than batching, unless the user said otherwise:

1. Locate the source by layer per `.claude/rules/architecture.md`.
2. Fix it following `vspathonis-code-style` and `.claude/rules/react-native-style.md`.
3. **Write the failing test first** if the bug is in domain logic — a browser-found bug that had no
   test is a coverage gap, and fixing it without one means it comes back.
4. Verify with `npm run check`, then reload the browser and re-run the flow that failed.
5. Keep reviewing the rest of the feature. Do not commit mid-review unless the user asks.

## Reporting

Per feature:

- **Exercised:** each acceptance criterion, the states it was checked from (first launch,
  mid-challenge), and a screenshot.
- **Console:** clean, or the exact messages.
- **Persistence:** which keys were written and that the state survived a reload.
- **Design system:** confirmed, or the violations found.
- **device-only, NOT verified in web:** the explicit list, or "none".
- **Fixed during review:** each bug, its cause, and how it was verified.

Do not re-test areas already confirmed earlier in the same session unless something changed
underneath them.
