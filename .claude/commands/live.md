---
description: Live review of the running app in a real browser — Expo for web driven through the Playwright MCP, screenshots per acceptance criterion, console errors, and an explicit device-only list.
---

# Live Review

Invoke the `expo-web-review` skill (`.claude/skills/expo-web-review/SKILL.md`) and follow it
exactly. `$ARGUMENTS` may name the screens or flows to exercise; the default is the acceptance
criteria of the backlog item currently in flight.

Report:

- **Exercised:** each acceptance criterion, the steps taken, and a screenshot.
- **Console:** the output of `browser_console_messages`. Zero errors is the bar; React key and
  `act()` warnings count as errors here.
- **Design system:** `ink` on every filled accent tile, only the three accents on screen, coral
  only for done/active, tokens not literals, no shadows, tabular figures on every number. Where the
  mockup covers the screen, a side-by-side screenshot against
  `Docs/mockups/home-screen.html` at 396px.
- **device-only: not verified —** every path react-native-web cannot honour (camera, local
  notifications, share sheet, document picker, native gestures, background timers). This list is
  mandatory and goes into the PR body verbatim.

If the app cannot start for web at all (before backlog feature 01, or a web-incompatible
dependency), report `LIVE: n/a — <reason>` and stop. That is a clean result, not a failure — but
say which acceptance criteria therefore went unverified.
