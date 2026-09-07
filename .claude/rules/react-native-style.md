# React Native style — deltas on top of `vspathonis-code-style`

The `vspathonis-code-style` skill (global, `~/.claude/skills/vspathonis-code-style/SKILL.md`) is
**binding in this repo**. Read it before writing any component. Its description names another
project and its examples are Next.js — that does not narrow it. It is the user's personal house
style and it applies to every React codebase, this one included.

This file records only what changes for Expo / React Native, and the handful of rules that get
broken most often here.

## What carries over unchanged (non-negotiable)

- **One component per file.** Arrow functions, never `function`.
- **No functions that return JSX** — extract a component.
- **No inline expressions in JSX.** No `??`, no `||`, no ternaries inside the template. Compute a
  named value above the return: `const habitLabel = decideHabitLabel(habit)`.
- **No `.map()` in a template.** Extract a `*List` component that owns the loop.
- **No prop spread.** List every prop explicitly.
- **No inline arrow functions in event handlers.** Name them: `const handleWaterAdd = () => …`.
- **Props types are `ComponentNameProps`.** Boolean props positive (`isComplete`, never
  `isNotComplete`). Don't mark a prop optional when it is always passed.
- **`isVisible` prop over `{flag && <Component />}`.**
- **Early-return guards, flat happy path.** Positive `if` conditions. No nested ternaries.
- **`null` over `undefined`**; absence handled in the parent with an early return. Never coerce a
  missing value to `''`, `0` or `[]`.
- **No magic strings or numbers.** `WATER_TARGET_LITRES = 3`, not `3`.
- **Descriptive names, no abbreviations, no single letters** — in tests too.
- **`const` over `let`.** No reassignment across branches.
- **Variant behaviour is one registry keyed by the discriminator**, never scattered `===` checks.
- **Every user-facing string goes through the translation layer**, from the first screen.
- **No em dashes in translation strings.**
- **Spacing between components belongs to the parent**, never to the child.
- **Extract logic to hooks; hooks must not compose other custom hooks.**

## Deltas for React Native

**Styling — `StyleSheet.create`, not SCSS and not Tailwind.**

- One `StyleSheet.create` per component file, declared at the bottom, named `styles`.
- **Never a colour literal in a component.** Every colour comes from `src/theme/tokens.ts`. A `#`
  outside `tokens.ts` is a review finding — see `design-system.md`.
- Spacing, radii and font sizes come from `src/theme/spacing.ts` / `radii.ts` / `typography.ts`.
  `padding: 20` in a component is a magic number.
- No inline `style={{ … }}` object literals. They allocate every render and they hide the value
  from the theme. A genuinely dynamic style is a named `useMemo`'d value or a second entry in
  `styles` selected by a named variable.
- `StyleSheet` has no cascade: do not try to style a child from a parent. Pass a prop.

**Routing — Expo Router replaces the Next.js `app/` rules, and keeps their spirit.**

- One routed screen per file under `app/`. A route file imports one screen component from
  `src/features/<feature>/` and renders it. No logic, no data access, no styles in a route file.
- Route folders stay one level deep and kebab-case. Flatten with a prefix instead of nesting:
  `app/settings/notifications.tsx`, never `app/settings/notifications/edit/index.tsx`.
- URL/params state (`useLocalSearchParams`) is read in the screen component, not in a leaf.

**No Server Components, no server actions, no SWR.** There is no server. The data-fetching sections
of the skill map onto repositories: a feature hook calls a repository, the repository holds the
port. Loading and error state is per-operation, exactly as the skill requires — a failed read shows
an error state, it never fabricates a fallback value.

**Platform primitives.**

- `Text` is mandatory — a bare string in a `View` crashes on native. Every string is inside `<Text>`.
- `Pressable` over `TouchableOpacity` for new code; give every tappable an `accessibilityRole` and
  an `accessibilityLabel` from the translation layer.
- Tap targets are at least 44×44. Habit tiles are far larger; icon buttons need explicit `hitSlop`.
- Lists that can grow (the 75-day grid, the journal history) use `FlatList` with a `keyExtractor`,
  never `.map()` inside a `ScrollView`.
- `SafeAreaView` / `useSafeAreaInsets` on every screen root. The dark background must run edge to
  edge under the status bar.

**Async and effects.**

- Every storage write is awaited and its failure handled. A floating promise is a review finding.
- No `setState` inside `useEffect` for anything derivable — derive it with `useMemo`.
- A timer screen does **not** hold elapsed time in state and tick it. It stores `startedAt` and
  recomputes `calculateElapsedMinutes(startedAt, now)` on an interval. The interval only forces a
  re-render; it is never the source of truth.
- Clean up every interval, subscription and `AppState` listener in the effect's return.

**Testing shape.** See `.claude/rules/testing.md`. Components are tested through
`@testing-library/react-native` by what the user sees, never by internal state.

## The traps specific to this app

- **Do not store a derived value.** The current day comes from `startDate`. The completed-habit
  count comes from the habits map. The spec stores `completedHabits` and `perfectDay` in the day
  record as a cache — that is a *write-time projection of a pure function*, never a second source
  of truth. Recompute, then persist; never edit the cached number directly.
- **`ink` on any filled accent, always.** White on coral, butter or lavender measures roughly
  1.5:1. Hard rule, not a preference. And the palette is those three — a green "success" or a red
  "error" arriving with a form is a fourth colour and does not belong here.
- **Every number carries `fontVariant: ['tabular-nums']`.** Timers, counters, weights and the day
  count jitter without it, and a jittering timer is the most visible bug in a habit app.
- **No shadows.** No `elevation`, no `shadowOpacity`. Depth comes from the card grey.
- **Never block on a photo.** A missing photo file degrades to a placeholder; it never throws and
  never blocks the day record from rendering.
