---
description: Run the full analyse → TDD → check → review → live browser review → commit → stacked PR cycle for the next feature in Docs/backlog.md, then stop.
---

# Ship Next Feature

Deliver **one** feature from `Docs/backlog.md` end-to-end and stop with an open PR **stacked on the
current tip**. `$ARGUMENTS` may name a backlog number to run instead of the next unchecked one;
otherwise take the first item whose status is `[ ]`.

This is a loop body: safe to run repeatedly (`/loop 25m /ship-next`). Every preflight failure is a
clean stop with a one-paragraph explanation, never a half-built feature.

## 0. Preflight — stop cleanly if any fails

1. Read `CLAUDE.md`, `.claude/rules/*.md`, `Docs/75-hard-gang-way-mvp.md`, and `Docs/backlog.md`.
2. **Identity.** `gh auth status` must show **`baggelisp`** as the active account. Otherwise stop:
   "gh is active as `<account>`; run `gh auth switch --user baggelisp`." Never open a PR on this
   repo from the work account.
3. **Clean tree.** `git status --porcelain` must be empty. Otherwise stop and list the files.
4. **Sync merged work into the backlog.** For every backlog item marked `[~]` (in PR), run
   `gh pr view <number> --json state,mergedAt`.
   - Merged → mark it `[x]` in the backlog. This edit is committed as part of *this* feature's PR,
     on this feature's branch, never on `main`.
   - Closed without merging → stop and ask the user what to do.
   - Still open → fine. This is a stack; open PRs are expected.
5. **Resolve the base** per `.claude/rules/git-workflow.md`:
   ```bash
   git fetch origin --prune
   gh pr list --state open --json number,headRefName,baseRefName
   ```
   Base = the head branch of the open `feat/*` PR with the highest feature number, or `origin/main`
   if none are open. Make sure the base branch exists locally and matches its remote.
6. **Stack depth.** If 5 or more `feat/*` PRs are open, say so and name the bottom PR the user
   should merge. Continue anyway — depth is the user's call.
7. **Pick the feature.** If none remain, stop: "Backlog complete."

## 1. Branch

```bash
git switch -c feat/NN-<slug> <base>
```

## 2. Analyse — a design note, no code yet

Write the note **in your reply**; it becomes the PR's "Design notes" section:

- Restate the feature's acceptance criteria from the backlog.
- List the files to create or modify, matching the layout in `.claude/rules/architecture.md`.
- State the approach and one rejected alternative with the reason.
- Name the test cases you will write first, per `.claude/rules/testing.md`.
- Flag any MVP constraint the feature touches: no backend, no auth, derived-not-stored values,
  timestamp-based timers, write-on-every-interaction.
- Say up front which parts are **device-only** and cannot be verified in `/live`.

Apply `superpowers:brainstorming` judgement, but do **not** wait for user approval — the backlog
item was approved when the backlog was; this step only makes the plan explicit. If the note reveals
the feature is under-specified or larger than one PR, stop and ask instead of guessing.

## 3. Implement with TDD

Invoke `superpowers:test-driven-development` and follow it strictly: failing test → watch it fail →
minimal code → green → refactor.

- Domain logic first, in `src/domain/`, pure and with time injected. It should be fully green
  before a single component exists.
- Then the storage/repository layer over an in-memory `KeyValueStore`.
- Then the UI, following `vspathonis-code-style` and `.claude/rules/react-native-style.md`.
- Colours, spacing and radii come from `src/theme/` — `.claude/rules/design-system.md` is binding.
- Update `Docs/backlog.md` (set this item to `[~]`; the PR number is filled in at step 7) and
  `README.md` for anything user-visible.

## 4. Quality gate

```bash
npm run check
```

Fully green: `tsc --noEmit` clean, zero eslint findings, all tests passing, architecture test
passing. Fix, don't skip. A legitimate exception is explicit, commented in the code, and named in
the PR body.

## 5. Code review

Run `/review`. Then:

- **CRITICAL** → fix, rerun step 4, rerun the review. Repeat until none remain. Maximum 3 rounds;
  if it still fails, stop and report rather than shipping.
- **WARNING** → fix if real and cheap; otherwise justify it in the PR's "Deferred" section.
- **SUGGESTION** → apply when it clearly improves the code, else ignore.

Invoke `superpowers:receiving-code-review` when judging findings. Verify before accepting — a
reviewer agent being confident is not evidence.

## 6. Live review in the browser

Run `/live`. It starts Expo for web and drives the real UI through the Playwright MCP.

- Every acceptance criterion is exercised in the running app, with a screenshot.
- Zero console errors. A React key warning or an act() warning counts.
- The dark theme renders correctly, `ink` is used on every filled accent tile, and no fourth
  colour has entered the coral/butter/lavender palette. Screens the mockup covers are screenshotted
  beside `Docs/mockups/home-screen.html`.
- Anything react-native-web cannot honour — camera, local notifications, share sheet, document
  picker, native gestures — is listed explicitly as `device-only: not verified`. Never imply a full
  pass over a path the browser could not run.
- A broken flow is a blocker: fix it, rerun step 4, rerun `/live`.

## 7. Verify, commit, push, stacked PR

Invoke `superpowers:verification-before-completion`: rerun `npm run check` and show the real output
before claiming anything passes.

```bash
git status --short                 # read it; stage by path only
git add <files...>
git commit -m "<conventional message per git-workflow.md>"
git push -u origin feat/NN-<slug>
gh pr create --base <base> --title "feat: NN — <title>" --body "<PR template from git-workflow.md>"
```

`--base` is the resolved base from preflight, **not** `main`, unless the stack was empty. Then put
the PR number into the backlog line (`[~] … — PR #<n>`) and push a second small commit
`docs(backlog): link PR #<n>`. Never amend — the branch is already pushed and something may be
stacked on it.

## 8. Stop and report

A final message that stands on its own:

- Feature number and title, PR URL, and **what it is stacked on** (base branch, depth).
- Verification summary: check output, review status, what `/live` exercised, screenshots.
- The `device-only: not verified` list, or "none".
- What the user should do: merge the bottom of the stack when ready; run `/ship-next` again for the
  next feature.
- Anything deferred.

Do **not** start the next feature.
