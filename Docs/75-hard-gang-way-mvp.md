# 75 Hard Gang Way - MVP Specification

App Name: 75 G-ANG

## Overview

**75 Hard Gang Way** is a mobile habit-tracking app designed to help users complete 11 daily discipline rules for 75 days.

### Tagline

> 75 Days. 11 Rules. A Better You.

---

# MVP Constraint: No Database

**The MVP has no backend and no database. Everything is stored locally on the device.**

This is a deliberate scope decision for the first release:

- No server, no API, no Supabase, no Firebase.
- **No login. No sign up. No accounts. No email. No password.** The app opens straight into the challenge.
- No cloud sync and no cross-device support.
- All habits, daily values, streaks, journal entries, and settings live in local storage.

Implications to accept for the MVP:

- Data is tied to the installed app. Deleting the app deletes the challenge.
- The user is implicit. There is no `user_id` anywhere in the MVP data model.
- Moving data between devices is handled by **manual export and import only**.

Authentication, a database, and automatic cloud sync are **post-MVP**. See Future Features.

The only supported way to back up or transfer a challenge is **Export Data** and **Import Data**. See section 12.

---

# Core Challenge Rules

Source of truth: `Docs/rules.jpeg`. The app tracks the following 11 daily habits:

1. **No alcohol and no cigarettes.**
2. **Healthy diet of your choice — not a single cheat meal**, no chocolate, no soft drinks. No meals after 22:00.
3. **Minimum 3 litres of water** per day.
4. **2 workouts per day, minimum 45 minutes each.** Ideally one of them outdoors.
5. **Minimum 45 minutes on a business or a new skill**, with no distractions.
6. **Read minimum 15 pages** per day from a book of your choice.
7. **After waking: 1 hour with no phone at all, and 3 hours with no content or social media.**
8. **No device in bed at night** (phone, iPad, TV).
9. **Daily weigh-in and progress photo in the mirror.**
10. **Minimum 15 minutes of spirituality** per day — meditation, prayer, or journaling.
11. **Minimum 15 minutes of real contact and conversation** with someone you love.

## Original Wording (Greek)

Kept verbatim so the rules do not drift during translation.

```text
1. ΚΑΘΟΛΟΥ ΑΛΚΟΟΛ & ΤΣΙΓΑΡΟ.
2. ΥΓΙΕΙΝΗ ΔΙΑΤΡΟΦΗ ΤΗΣ ΕΠΙΛΟΓΗΣ ΣΟΥ ΧΩΡΙΣ ΟΥΤΕ ΕΝΑ CHEAT MEAL,
   ΣΟΚΟΛΑΤΑ Η ΑΝΑΨΥΚΤΙΚΟ ΚΛΠ (ΟΧΙ ΓΕΥΜΑΤΑ ΜΕΤΑ ΤΙΣ 22:00).
3. ΚΑΤΑΝΑΛΩΣΗ MINIMUM 3 ΛΙΤΡΑ ΝΕΡΟ ΤΗΝ ΗΜΕΡΑ.
4. 2 ΠΡΟΠΟΝΗΣΕΙΣ ΤΗΝ ΗΜΕΡΑ (ΜΙΑ ΙΔΑΝΙΚΑ ΕΚΤΟΣ ΣΠΙΤΙΟΥ & MINIMUM 45' Η ΚΑΘΕΜΙΑ).
5. 45' MINIMUM ΕΝΑΣΧΟΛΗΣΗ ΜΕ ΚΑΠΟΙΟ BUSINESS Η ΝΕΟ SKILL ΧΩΡΙΣ ΠΕΡΙΣΠΑΣΜΟΥΣ.
6. ΔΙΑΒΑΣΜΑ MINIMUM 15 ΣΕΛΙΔΕΣ ΤΗΝ ΗΜΕΡΑ ΑΠΟ ΒΙΒΛΙΟ ΤΗΣ ΕΠΙΛΟΓΗΣ ΣΟΥ.
7. ΟΤΑΝ ΞΥΠΝΗΣΕΙΣ ΓΙΑ 1 ΩΡΑ ΚΑΘΟΛΟΥ ΚΙΝΗΤΟ, ΚΑΙ ΓΙΑ 3 ΩΡΕΣ
   ΟΧΙ ΚΑΤΑΝΑΛΩΣΗ CONTENT & SOCIAL MEDIA.
8. ΚΑΜΙΑ ΣΥΣΚΕΥΗ (ΚΙΝΗΤΟ, IPAD, ΤΗΛΕΟΡΑΣΗ) ΣΤΟ ΚΡΕΒΑΤΙ ΤΟ ΒΡΑΔΥ.
9. ΚΑΘΗΜΕΡΙΝΟ ΖΥΓΙΣΜΑ & ΦΩΤΟΓΡΑΦΙΑ ΠΡΟΟΔΟΥ ΣΤΟΝ ΚΑΘΡΕΦΤΗ.
10. MINIMUM 15' ΠΝΕΥΜΑΤΙΚΟΤΗΤΑΣ ΤΗ ΜΕΡΑ - MEDITATION Η ΠΡΟΣΕΥΧΗ Η JOURNALING.
11. 15' ΤΗ ΜΕΡΑ ΟΥΣΙΑΣΤΙΚΗ ΕΠΑΦΗ & ΣΥΖΗΤΗΣΗ ΜΕ ΟΠΟΙΟΔΗΠΟΤΕ ΑΓΑΠΗΜΕΝΟ ΣΟΥ ΠΡΟΣΩΠΟ.
```

## Three Challenges

The rules above are the **Hard** challenge and are never softened. Two lighter challenges exist so
someone can start where they actually are.

| Mode | Rules | Who it is for |
|------|-------|---------------|
| **Easy** | 6 | Building the base habits before raising the bar |
| **Medium** | 9 | Adds diet, focused work and real conversation, at tougher targets |
| **Hard** | 11 | The full 75 Hard Gang Way, exactly as `Docs/rules.jpeg` states it |

Easy and Medium are **strict subsets** of Hard: every habit in a lighter challenge also appears in
a harder one, at a target that is equal or harder. Moving up is a step, never a different
challenge.

### Easy — 6 rules

| # | Rule | Target |
|---|------|--------|
| 1 | No alcohol & no cigarettes | tap |
| 3 | Water | 2 litres |
| 4 | Workouts | 1 session of 30 minutes |
| 6 | Reading | 5 pages |
| 8 | No devices in bed | tap |
| 10 | Spirituality | 10 minutes |

### Medium — 9 rules

| # | Rule | Target |
|---|------|--------|
| 1 | No alcohol & no cigarettes | tap |
| 2 | Healthy diet | tap |
| 3 | Water | 2.5 litres |
| 4 | Workouts | 1 session of 45 minutes |
| 5 | Business or skill | 30 minutes |
| 6 | Reading | 10 pages |
| 8 | No devices in bed | tap |
| 10 | Spirituality | 15 minutes |
| 11 | Connection | 15 minutes |

### Hard — 11 rules

Every rule above, at the targets in `Docs/rules.jpeg`. This is the challenge the app is named
after and its rules are fixed.

The mode is chosen during onboarding, stored on the challenge record, and cannot be changed
mid-challenge — a streak only means something against a fixed set of rules. Changing challenge
means resetting.

A perfect day is **all the rules of your own challenge**: six on Easy, nine on Medium, eleven on
Hard.

## Habit IDs

Used everywhere in the data model:

```text
no-alcohol      diet            water           workouts
skill           reading         morning-detox   no-devices-bed
weigh-in        spirituality    connection
```

---

# MVP Goal

The primary goal is to make it simple and motivating for users to:

- Track their daily habits
- Monitor their 75-day challenge progress
- Build streaks
- Track measurable habits such as water and reading
- Maintain daily consistency

---

# App Navigation

The MVP contains four main screens:

- Today
- Progress
- Journal
- Profile

---

# 1. Onboarding

First-time users see a short introduction to the challenge.

## Features

- Welcome screen
- Challenge explanation
- Display the 11 rules
- Select challenge start date
- Start challenge button
- Optional name setup

There is no sign up or login step. The name is optional and stored locally.

Once started, Day 1 begins and the 75-day countdown starts. The start date is written to local storage and the current day is always derived from it.

---

# 2. Today Screen

The Today screen is the main screen of the application.

Users should immediately see:

- Current challenge day
- Overall progress percentage
- Current streak
- Number of completed habits

Example:

```text
DAY 12 OF 75

16% COMPLETE

CURRENT STREAK: 12 DAYS

6 / 11 HABITS COMPLETED
```

---

# 3. Daily Habit Checklist

Display all 11 habits as interactive cards.

Each card contains:

- Habit number
- Icon
- Habit title
- Short description
- Completion status

Example:

```text
Healthy Diet
No cheat meal. Nothing after 22:00.

Read 15 Pages
0 / 15 pages

Workouts
1 / 2 done
```

Users can tap to complete simple habits. Habits with a target open a detail screen instead.

---

# 4. Smart Habit Tracking

Six of the eleven habits are a simple tap. Five need a value, a timer, or a photo.

| # | Habit | Tracking |
|---|-------|----------|
| 1 | No alcohol / cigarettes | Tap |
| 2 | Healthy diet | Tap (with a 22:00 cut-off reminder) |
| 3 | Water | Counter, target 3 L |
| 4 | Workouts | 2 timers, 45 min each |
| 5 | Business / skill | Timer, 45 min |
| 6 | Reading | Counter, target 15 pages |
| 7 | Morning detox | 2 timers, 1 h phone-free + 3 h no content |
| 8 | No devices in bed | Tap |
| 9 | Weigh-in + photo | Number input + camera |
| 10 | Spirituality | Timer, 15 min |
| 11 | Connection | Timer, 15 min |

## Water Tracker

```text
0 / 3 Litres

+250ml
+500ml
+1L
```

The habit automatically completes at 3 litres.

## Reading Tracker

```text
8 / 15 Pages

+1 Page
+5 Pages
```

The habit automatically completes at 15 pages.

## Workout Timers

The rule requires **two separate workouts of at least 45 minutes each**, ideally one of them outdoors.

```text
WORKOUT 1     ✓ 48:20   Outdoor
WORKOUT 2     00:12:05 / 45:00

START
PAUSE
RESUME
```

Rules:

- Two independent timers. Both must reach 45 minutes.
- Each workout has an optional **Outdoor** toggle.
- The habit completes only when both workouts are done.
- A workout can also be marked done manually if the user forgot to start the timer.

## Business / Skill Timer

Track focused work with no distractions:

```text
00:20:00 / 45:00

START FOCUS SESSION
```

## Morning Detox Timers

Rule 7 has two windows, both starting when the user wakes up.

```text
NO PHONE          00:34:10 / 1:00:00
NO CONTENT        01:12:44 / 3:00:00

I WOKE UP  →  starts both
```

Rules:

- Tapping **I woke up** starts both windows at once.
- The 1 hour phone-free window and the 3 hour no-content window run in parallel.
- The habit completes when both windows finish.
- The MVP does **not** block phone or app usage. It is an honesty timer.
- Both timers keep running while the app is closed, since only the start timestamp is stored.

## Spirituality and Connection Timers

Both are simple 15 minute timers.

```text
MEDITATION / PRAYER / JOURNALING     00:07:30 / 15:00
CONVERSATION                          00:15:00 / 15:00
```

## Weigh-In and Progress Photo

Rule 9 needs a number and a photo every day.

```text
WEIGHT        88.4 kg        [ - ]  [ + ]

PROGRESS PHOTO

[ TAKE PHOTO ]   [ CHOOSE FROM LIBRARY ]
```

Rules:

- The habit completes only when **both** the weight and the photo are recorded.
- Weight is stored in kilograms with one decimal.
- Photos are saved to the app's own local directory, never uploaded.
- The day record stores the file path, not the image itself.
- The Progress screen can show a weight trend and a photo timeline built from these entries.

Every value, timer state, and photo path is written straight to local storage, so closing the app never loses progress.

---

# 5. Daily Progress

The app calculates daily completion automatically.

```text
TODAY'S PROGRESS

7 / 11 COMPLETE

64%
```

## Perfect Day

A Perfect Day occurs when all 11 habits are completed.

```text
11 / 11 COMPLETE

PERFECT DAY
```

Show a simple celebration animation when completed.

---

# 6. 75-Day Progress Screen

Users can view their entire challenge journey.

## Progress Overview

Display:

- Current day
- Days completed
- Days remaining
- Current streak
- Longest streak

Example:

```text
DAY 12 / 75

Completed Days: 11
Remaining Days: 63

Current Streak: 12 Days
Best Streak: 12 Days
```

## 75-Day Grid

Display a visual challenge calendar:

All 75 days as circles, 15 per row, 5 rows.

```text
● ● ● ● ● ● ○ ● ● ● ● ◉ · · ·
· · · · · · · · · · · · · · ·
· · · · · · · · · · · · · · ·
· · · · · · · · · · · · · · ·
· · · · · · · · · · · · · · ·
```

| Circle | State |
|--------|-------|
| Coral filled | Perfect day, all 11 done |
| Grey filled | Day logged but not perfect |
| Butter filled with a glow | Today |
| Hollow outline | Not started yet |

A missed day is grey, never red.

Users can tap any past day to review what they completed. The grid is built from the locally stored day records.

---

# 7. Journal Screen

Users can write one daily reflection.

## Journal Fields

- How was your day?
- What went well?
- What was difficult?
- What will you improve tomorrow?

Users can save one journal entry per day. Entries are stored locally and never leave the device.

---

# 8. Profile Screen

Display user information and challenge statistics.

## Profile Information

- Name
- Challenge start date
- Current day
- Current streak
- Best streak

All of this is read from local storage. No email and no account are collected.

## Settings

- Edit profile
- Notification settings
- Export data
- Import data
- Reset challenge
- Restart challenge
- Dark mode

Reset and restart simply clear or reinitialise the local storage keys.

---

# 9. Streak System

The app tracks consistency.

## Current Streak

Number of consecutive Perfect Days.

## Best Streak

Longest streak achieved by the user.

A Perfect Day requires completion of all 11 habits.

Streaks are recalculated on the device from the stored day records.

---

# 10. Notifications

The MVP should include basic reminders.

## Morning Reminder

> Good morning. Day 12 of your challenge starts today. Stay disciplined.

## Evening Reminder

> You have completed 7 of 11 habits. Finish strong.

Users can enable or disable notifications.

Reminders are scheduled locally on the device (for example `expo-notifications`). There is no push server in the MVP.

---

# 11. Achievements

Basic gamification system.

## MVP Badges

### 7 Day Warrior
Complete 7 consecutive days.

### Perfect Week
Complete all 11 habits for 7 days.

### 30 Day Discipline
Reach Day 30.

### Halfway There
Reach Day 38.

### 75 Hard Complete
Complete all 75 days.

---

# 12. Data Export / Import

Since there is no account and no cloud, export and import are the only way to back up a challenge or move it to another phone.

Both live in **Settings**. No extra screen is needed.

## Export Data

Writes the entire local storage state to a single JSON file and opens the native share sheet.

```text
EXPORT DATA

Saves your challenge, habits, streaks
and journal to a single file.

[ EXPORT ]
```

Behaviour:

- Filename: `75gang-backup-YYYY-MM-DD.json`
- Contains profile, challenge, days, journal, and settings.
- **Progress photos are not included.** The JSON keeps the weight values and the photo paths; the image files stay on the device. This is a deliberate MVP limitation — bundling 75 photos would make the export far too large to share as a single JSON file.
- Shared through the native share sheet (Files, AirDrop, email, cloud drive).
- Read-only operation. Nothing local changes.

## Import Data

Reads a previously exported JSON file and restores it.

```text
IMPORT DATA

Restoring will replace your current
challenge and journal.

[ CHOOSE FILE ]
```

Behaviour:

- Opens the native document picker, JSON only.
- Validates the file before writing anything.
- **Replaces** all local data. This is a full restore, not a merge.
- Requires an explicit confirmation because the current challenge is overwritten.
- On success, the app reloads to the Today screen on the correct challenge day.
- Photo paths that point to missing files degrade gracefully: the day still shows the weight, with a placeholder where the photo would be.

## Export File Format

```json
{
  "app": "75gang",
  "schemaVersion": 1,
  "exportedAt": "2026-09-07T22:30:00.000Z",
  "profile": { "...": "..." },
  "challenge": { "...": "..." },
  "days": { "...": "..." },
  "journal": { "...": "..." },
  "settings": { "...": "..." }
}
```

The payload is exactly the five local storage keys, wrapped with a small header.

## Validation Rules

Reject the import with a clear message when:

- The file is not valid JSON.
- `app` is not `75gang`.
- `schemaVersion` is newer than the version the app understands.
- `challenge.startDate` is missing or not a valid date.

Unknown extra fields are ignored rather than treated as errors, so older exports keep working.

## Out of Scope for the MVP

- Merging two exports.
- Automatic or scheduled backups.
- Partial import, for example journal only.
- Encryption of the export file.
- Exporting the progress photos. A photo archive can be added post-MVP.

---

# User Flow

```text
OPEN APP
    ↓
VIEW TODAY'S CHALLENGE
    ↓
COMPLETE DAILY HABITS
    ↓
TRACK WATER / READING / TIMERS
    ↓
COMPLETE 11 / 11
    ↓
PERFECT DAY CELEBRATION
    ↓
WRITE JOURNAL ENTRY
    ↓
VIEW PROGRESS
    ↓
REPEAT FOR 75 DAYS
```

---

# MVP Screens

The first release should contain:

1. Onboarding
2. Today Screen
3. Habit Detail / Timer Screen
4. Progress Screen
5. Journal Screen
6. Profile Screen
7. Settings

There is no Sign Up or Login screen in the MVP.

---

# MVP Features Priority

## Must Have

- Local storage persistence (no backend)
- Export data / Import data (JSON file)
- Start 75-day challenge
- 11 daily habits
- Daily checklist
- Water tracker
- Reading tracker
- Two workout timers (45 min each)
- Skill/business timer
- Morning detox timers (1 h phone-free + 3 h no content)
- Spirituality and connection timers
- Daily weigh-in and progress photo
- Daily progress calculation
- 75-day progress tracking
- Streak system
- Journal
- Notifications

## Nice to Have

- Achievements
- Mood tracking
- Weekly reports
- Advanced analytics
- Custom reminders

## Future Features

Do not include these in the initial MVP:

- User authentication / accounts
- Backend database
- Automatic cloud synchronisation and multi-device support (manual export/import only in the MVP)
- Social feed
- Friends
- Chat
- Leaderboards
- AI coach
- Apple Health integration
- Wearable integration
- Community groups
- Subscription system

---

# Local Data Structure

There are no tables and no `user_id`. Everything is a JSON value written to a local storage key.

## Storage Keys

```text
@75gang/profile
@75gang/challenge
@75gang/days          (map keyed by date: YYYY-MM-DD)
@75gang/journal       (map keyed by date: YYYY-MM-DD)
@75gang/settings

<app documents>/photos/YYYY-MM-DD.jpg    (progress photos, files not JSON)
```

## Profile

```json
{
  "name": "Vangelis",
  "createdAt": "2026-09-07T08:00:00.000Z"
}
```

## Challenge

```json
{
  "startDate": "2026-09-07",
  "mode": "hard",
  "totalDays": 75,
  "currentStreak": 12,
  "longestStreak": 12,
  "status": "active"
}
```

`status` is one of `active`, `completed`, `reset`. `mode` is one of `easy`, `medium`, `hard` and
decides which rules the challenge is scored against.

The current day is derived from `startDate` and today's date. It is never stored.

## Habits

The 11 habits are a **hardcoded constant in the app**, not stored data. The challenge's `mode`
selects which of them apply and at what target.

```json
{
  "id": "water",
  "name": "Drink 3 Litres",
  "description": "Minimum 3 litres of water",
  "icon": "droplet",
  "targetValue": 3,
  "targetType": "litres"
}
```

Target types:

- `boolean` — a simple tap
- `litres` — water
- `pages` — reading
- `minutes` — skill, spirituality, connection
- `sessions` — workouts, two of 45 minutes
- `windows` — morning detox, 60 and 180 minutes
- `measurement` — weigh-in, a number plus a photo

## Days

One entry per date, holding the per-habit values and the day summary.

```json
{
  "2026-09-07": {
    "habits": {
      "no-alcohol":     { "completed": true,  "value": null },
      "diet":           { "completed": true,  "value": null },
      "water":          { "completed": false, "value": 2.5 },
      "workouts":       { "completed": false, "value": 1,
                          "sessions": [
                            { "minutes": 48, "outdoor": true,  "completedAt": "2026-09-07T08:40:00.000Z" }
                          ] },
      "skill":          { "completed": true,  "value": 45 },
      "reading":        { "completed": false, "value": 12 },
      "morning-detox":  { "completed": false,
                          "wokeUpAt": "2026-09-07T07:10:00.000Z",
                          "phoneFreeMinutes": 60,
                          "noContentMinutes": 145 },
      "no-devices-bed": { "completed": false, "value": null },
      "weigh-in":       { "completed": true,  "weightKg": 88.4,
                          "photo": "photos/2026-09-07.jpg" },
      "spirituality":   { "completed": true,  "value": 15 },
      "connection":     { "completed": true,  "value": 15 }
    },
    "completedHabits": 7,
    "totalHabits": 11,
    "completionPercentage": 64,
    "perfectDay": false,
    "updatedAt": "2026-09-07T21:14:00.000Z"
  }
}
```

Habits with a simple tap use `value: null`. The rest carry their own shape:

- `workouts` — an array of sessions; complete at two sessions of 45 minutes or more.
- `morning-detox` — a wake-up timestamp plus elapsed minutes in each of the two windows.
- `weigh-in` — a weight in kilograms plus a relative photo path.

The `value` field tracks the simple measurable habits.

Examples:

- Water: 2.5 litres
- Reading: 12 pages
- Skill: 45 minutes
- Spirituality: 15 minutes
- Weight: 88.4 kg

`completedHabits`, `completionPercentage`, and `perfectDay` are derived from `habits`, but stored so the 75-day grid and streak calculation stay cheap.

## Journal

```json
{
  "2026-09-07": {
    "content": "Hard day but I finished.",
    "whatWentWell": "Hit the water target early.",
    "whatWasDifficult": "The phone-free hour.",
    "tomorrowGoal": "Read before bed instead of scrolling.",
    "createdAt": "2026-09-07T22:05:00.000Z"
  }
}
```

One entry per day, keyed by date.

## Settings

```json
{
  "darkMode": true,
  "notificationsEnabled": true,
  "morningReminder": "07:00",
  "eveningReminder": "20:00"
}
```

## Notes on Local Persistence

- Write on every habit interaction so a force-quit never loses progress.
- Timers persist a start timestamp, not a tick counter, so elapsed time survives backgrounding and restarts.
- Reset challenge clears `@75gang/challenge`, `@75gang/days`, and `@75gang/journal`, deletes the photos directory, and keeps profile and settings.
- Morning detox and workout timers are driven by stored timestamps, so a full hour still elapses correctly with the app closed.
- Keep the shape flat and serialisable so it can be pushed to a real backend later without a rewrite.

---

# Recommended Tech Stack

## Mobile App

**React Native with Expo**

Benefits:

- One codebase
- iOS support
- Android support
- Fast development
- Good notification support

## Storage

**Device local storage only. No backend.**

Options:

- `AsyncStorage` (`@react-native-async-storage/async-storage`) — simple and sufficient for the MVP.
- `react-native-mmkv` — faster alternative if timer writes feel sluggish.

For export and import:

- `expo-file-system` — write the backup JSON file.
- `expo-sharing` — hand the file to the native share sheet.
- `expo-document-picker` — let the user choose a file to import.

For the daily progress photo:

- `expo-image-picker` — camera capture and library selection.
- Photos are copied into the app's own documents directory and referenced by relative path.

## Backend (Post-MVP)

No backend ships with the MVP. When accounts and sync are eventually needed, Supabase is the intended target for authentication, database, and cloud synchronisation.

---

# Design Direction

Reference: `Docs/mockup.png`. Mockup of the home screen: `Docs/mockups/home-screen.html`.

Warm near-black surfaces, three accent colours, heavy uppercase headings, big tabular numbers.

## Theme

Dark only. There is no light theme in the MVP — the app commits to one visual world.

## Color Palette

### Surfaces

| Token | Hex | Use |
|-------|-----|-----|
| `bg` | `#1A191C` | App background (warm near-black) |
| `card` | `#252429` | Every card |
| `raised` | `#2E2D33` | Pressed and hover states |
| `hairline` | `rgba(255,255,255,0.07)` | Dividers, ring tracks |

### Text

| Token | Hex | Use |
|-------|-----|-----|
| `text` | `#F4F3F6` | Headings, numbers |
| `textSecondary` | `#9A98A1` | Labels, captions |
| `textTertiary` | `#6E6C76` | Axis labels, hints |
| `ink` | `#1A1712` | Text on any filled accent tile |

### Accents

Three only. No green, no blue, no fourth colour.

| Token | Hex | Meaning |
|-------|-----|---------|
| `coral` | `#EE9080` | Primary. Completed, active tab, trend line |
| `butter` | `#F1DD79` | Streak, water |
| `lavender` | `#A6ADED` | Weight, a timer that is running |

Rules:

- **Text on any filled accent tile is `ink`.** White measures roughly 1.5:1 on all three and is unreadable.
- Coral means done or active. Never use it decoratively.
- A missed day is grey, never red. The grid says whether a day was perfect, it does not scold.
- Lavender marks a running timer — rules 4 and 7 for most of the day.
- One accent per card, and never more than two filled tiles in a row.
- Greys are warm, not blue. That is what stops the coral from glowing.

## Typography

| Role | Face | Use |
|------|------|-----|
| Display | Archivo 700–800 | Greeting, card values, all big numbers |
| Body | Manrope 400–700 | Rule names, captions, buttons |

- Section labels are uppercase, ~10px, `0.13em` letter-spacing.
- All numbers use `tabular-nums` so columns and timers do not jitter.
- Headings are uppercase with tight negative tracking.

## Home Screen Layout

Top to bottom, matching the reference:

1. Date and day kicker, `HEY, {NAME}` greeting, avatar with a butter status dot.
2. **Today** card — three concentric rings (habits, workouts, water) with a legend beside them.
3. Two filled tiles side by side — **Streak** in butter, **Weight** in lavender.
4. **Challenge** card — perfect days and days remaining as two big numbers.
5. **The 11 rules** — a tappable checklist, coral checkbox when done.
6. Tab bar — Today, Progress, Journal, Profile. Active tab is a coral pill.

The home screen shows **today only**. History lives on the Progress tab — the home screen must not turn into a second progress screen.

## UI Style

- Cards at 24px radius, tiles at 24px, checkboxes at 7px.
- Rounded ring caps, 12px stroke, faint white track behind each ring.
- Rows inside a card are separated by hairlines, not by gaps or borders.
- No shadows inside the app. Depth comes from the card grey alone.

## Main Design Principles

- Open the app and understand today's progress instantly.
- Completing habits should require minimal effort.
- Progress should feel rewarding.
- Avoid unnecessary screens.
- Make daily use fast and engaging.

---

# Success Metric

The MVP is successful if users:

1. Open the app daily.
2. Complete habits consistently.
3. Continue using the app beyond 7 days.
4. Reach the full 75-day challenge.

The most important metric is:

> Daily active completion rate.

---

# Product Vision

75 Hard Gang Way should become a personal discipline operating system.

The MVP starts with:

**75 Days. 11 Rules.**

Future versions can expand into customizable challenges, communities, AI coaching, advanced analytics, and accountability systems.
