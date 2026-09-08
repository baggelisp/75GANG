# Design system — binding

Sources, in order of authority:

1. `Docs/mockups/home-screen.html` — the built mockup. Exact colours, radii, type scale and ring
   geometry. When a number is in dispute, read it here.
2. `Docs/mockup.png` — the visual reference the mockup was built from.
3. The "Design Direction" section of `Docs/75-hard-gang-way-mvp.md`.

Warm near-black surfaces, **three** accent colours, heavy uppercase headings, big tabular numbers.
Dark only — there is no light theme in the MVP and no code should anticipate one.

## Tokens — `src/theme/tokens.ts` is the only file with a colour literal

### Surfaces

| Token | Value | Use |
|---|---|---|
| `bg` | `#1A191C` | App background (warm near-black) |
| `card` | `#252429` | Every card |
| `raised` | `#2E2D33` | Pressed and hover states |
| `hairline` | `rgba(255,255,255,0.07)` | Dividers, ring tracks |

### Text

| Token | Value | Use |
|---|---|---|
| `text` | `#F4F3F6` | Headings, numbers |
| `textSecondary` | `#9A98A1` | Labels, captions |
| `textTertiary` | `#6E6C76` | Axis labels, hints |
| `ink` | `#1A1712` | Text and icons on any filled accent tile |

### Accents — three only

**No green. No blue. No fourth colour.** If a new state seems to need one, it does not — reuse one
of these three or express the state with shape, weight or a label.

| Token | Value | Meaning |
|---|---|---|
| `coral` | `#EE9080` | Primary. Completed, active tab, habits ring, trend line |
| `butter` | `#F1DD79` | Streak, water |
| `lavender` | `#A6ADED` | Weight, workouts, a timer that is running |

Rules:

1. **Text and icons on any filled accent tile are `ink`.** White measures roughly 1.5:1 on all
   three and is unreadable. This is the most common violation — check every tile, badge, pill and
   checkbox.
2. **Coral means done or active.** Never decorative.
3. **Lavender marks a running timer** — in practice rules 4 and 7 for most of the day.
4. **Butter means streak or water.** Nothing else.
5. **One accent per card, and never more than two filled tiles in a row.**
6. **Greys stay warm.** Never substitute a blue-grey; the warmth is what stops the coral glowing.
7. **A colour keeps its meaning across every screen.** Water is butter on Today and on Progress.
8. **No colour literal outside `tokens.ts`** — including `rgba()`. Alpha variants get a name.

## Typography

Two families, loaded through `@expo-google-fonts` and gated behind the splash screen until ready.

| Role | Face | Use |
|---|---|---|
| Display | **Archivo** 600 / 700 / 800 | Greeting, card values, every big number |
| Body | **Manrope** 400 / 500 / 600 / 700 | Rule names, captions, buttons |

Scale, taken from the mockup — put these in `src/theme/typography.ts`, never inline:

| Name | Size | Weight | Tracking | Case |
|---|---|---|---|---|
| `kicker` | 10 | 600 | `0.14em` | upper |
| `sectionLabel` | 11 | 700 | `0.13em` | upper |
| `microLabel` | 9.5 | 700 | `0.1em` | upper |
| `greeting` | 27 | 800 | `-0.03em` | upper |
| `hero` | 40 | 800 | `-0.045em` | — |
| `tileValue` | 30 | 800 | `-0.035em` | — |
| `statValue` | 26 | 800 | `-0.03em` | — |
| `legendValue` | 20 | 700 | `-0.02em` | — |
| `ruleName` | 12.5 | 600 | — | — |
| `ruleMeta` | 10.5 | 500 | — | — |
| `tabLabel` | 9.5 | 700 | `0.1em` | upper |

- **Every number uses `fontVariant: ['tabular-nums']`** so timers and columns do not jitter. A
  timer or counter without it is a finding.
- Headings are uppercase with tight negative tracking. Section labels are uppercase with wide
  positive tracking. The contrast between those two is the type system.
- React Native has no `letter-spacing: em` — convert to points at the given size
  (`0.13em` at 11px = `1.43`). Do the conversion in `typography.ts`, once.

## Shape

| Element | Value |
|---|---|
| Card radius | 24 |
| Tile radius | 24 |
| Rule row radius | 14 (on the pressed state) |
| Checkbox radius | 7 |
| Pill / badge radius | 99 |
| Avatar | circle |
| Ring stroke | 12, round caps |

- **No shadows anywhere inside the app.** Depth comes from the card grey alone. An `elevation` or
  `shadowOpacity` in a component is a finding.
- **Rows inside a card are separated by `hairline`, not by gaps or borders.** A row list uses a
  1px hairline between rows and no divider before the first or after the last.

## The rings

The Today card's three concentric rings, from `Docs/mockups/home-screen.html`:

| Ring | Radius | Colour | Measures |
|---|---|---|---|
| Outer | 52 | `coral` | Habits — completed of 11 |
| Middle | 38 | `lavender` | Workouts — sessions of 2 |
| Inner | 24 | `butter` | Water — litres of 3 |

`viewBox="0 0 128 128"`, rotated `-90` around the centre so each ring starts at twelve o'clock,
stroke width 12, round caps, each drawn over a full-circle track in `hairline`. Progress is a
`strokeDasharray` of `<arc> <remainder>` — never a rotation trick.

Rendered with `react-native-svg`. The legend sits beside the rings: label in the ring's accent,
value with a small unit suffix, and the fraction on the right.

## Icons

Icons come from **`@expo/vector-icons`**. Never hand-draw one as an SVG path, and never type a
glyph or an emoji into a label — a hand-drawn path drifts from the set, and a typed glyph falls
back to a missing character on a device that lacks it.

```tsx
import AntDesign from '@expo/vector-icons/AntDesign';

<AntDesign name="arrow-left" size={18} color={colors.text} />;
```

- **Back is always `AntDesign` `arrow-left`**, and it always sits beside the label. A word alone
  reads as an action that could go anywhere; the arrow says which direction before anyone reads it.
- **`color` comes from `tokens.ts`**, like every other colour. An icon is content, not chrome, and
  `color="black"` on this app's near-black ground is invisible.
- **`size` is a named constant** in the component, not a number in the JSX.
- An icon that carries meaning on its own needs an `accessibilityLabel`. One that sits next to a
  label it repeats does not — the label already says it.

`react-native-svg` stays for **drawings**, not icons: the progress rings, the trend line, and the
onboarding illustrations.

## Controls

Two platform components paint their own colours and must not be used:

- **`Switch`** — its thumb and track come from the OS, and no combination of `trackColor` and
  `thumbColor` reliably suppresses them. On react-native-web the "on" thumb renders **teal**, which
  is a fourth colour. Use `src/components/ToggleSwitch.tsx`.
- **`@react-native-community/datetimepicker`** — no web support at all, and the browser is where
  this app is reviewed. Dates are picked on a calendar built from `src/components/calendar/`.

**A disabled control is a surface, not a faded one.** `opacity` on a filled accent composites to a
muddy colour with `ink` text on top and reads as broken. A disabled `PrimaryButton` is `raised`
with a `textTertiary` label. Opacity is only for something that stays legible as itself — a dimmed
arrow at the end of a stepper, say.

**A `raised` surface needs an outline on anything sitting on it.** A `SecondaryButton` filled with
`raised` disappears into a confirmation dialog and reads as a line of text.

## Dates and calendars

Every date the user reads goes through `src/utils/DateUtility.ts`. Never inline a
`toLocaleDateString`, and never build a `Date` to do calendar arithmetic — that lives in
`src/domain/calendar.ts` and `src/domain/monthGrid.ts`, as pure day-number maths.

- **A calendar is Monday-first, seven columns, with weekday headings.** A flat run of cells reads
  as a progress bar; weekday columns are what make "I always miss Sundays" visible. The shared
  pieces are `WeekdayHeader`, `CalendarWeek`, `CalendarSlot`, `MonthTitle` and `PeriodStepper`.
- **A missing day is a gap, not a skip.** Closing it slides every later day into the wrong weekday
  column and lies about the whole month.
- **Every cell carries its day of the month.** A bare dot says only "a day"; the number lets
  someone find the Saturday they remember.
- **A date that outlives its month carries its year** — `formatLongDateWithYear`. A challenge start
  or a past day shown as "Wed, Jul 29" is ambiguous the moment there is a second challenge.
- **A cell state is never colour alone.** Coral filled with an `ink` number for perfect, butter
  filled for today (the spec's "butter filled with a glow"), a solid warm grey for missed, and an
  outline on the app ground for still to come — plus a legend that says all four in words.

## Accessibility

- Every tappable has an `accessibilityRole` and an `accessibilityLabel` from the translation layer.
- Minimum tap target 44×44. The rule rows are tall enough; the checkbox alone is not — the whole
  row is the target.
- **The rings carry one `accessibilityLabel` describing all three values** ("Habits 6 of 11,
  workouts 1 of 2, water 2.5 of 3 litres"), as the mockup does. Three separate silent circles are
  not accessible.
- Completion is never signalled by colour alone. A done rule shows a coral checkbox **with a check
  mark in `ink`**; the mark is what survives greyscale and colour-blindness.
- `text` or `textSecondary` on a surface, `ink` on an accent. Nothing else. `textTertiary` is for
  axis labels and hints only, never for content the user must read.

## Motion

- The Perfect Day celebration is the one real animation. Everything else is a transition.
- Ring fills animate on mount, briefly. They never animate on every re-render.
- Respect `AccessibilityInfo.isReduceMotionEnabled()` — both degrade to a static state.
