# Git workflow — stacked PRs

One feature = one branch = one PR. Work never waits for a merge: each feature branches from the
**tip of the stack** and its PR is based on that branch, so every PR's diff contains only its own
feature.

## The stack

```
origin/main
  └── feat/01-scaffold          PR #1  --base main
        └── feat/02-theme       PR #2  --base feat/01-scaffold
              └── feat/03-storage  PR #3  --base feat/02-theme
```

The user merges on GitHub, bottom-up. When #1 merges, GitHub auto-retargets #2 to `main`. Merging
in order needs no restacking at all.

## Resolving the base — do this before every branch

```bash
git fetch origin --prune
gh pr list --state open --json number,headRefName,baseRefName --jq '.[] | "\(.number) \(.headRefName) <- \(.baseRefName)"'
```

- **Some `feat/*` PRs are open** → the base is the head branch of the open PR with the highest
  feature number. That is the stack tip.
- **No `feat/*` PR is open** → the base is `origin/main`.
- **The stack tip's branch is missing locally** → `git fetch origin <branch>:<branch>` first. Never
  branch from a stale local copy.

```bash
git switch -c feat/NN-slug <base>       # <base> is origin/main or the tip branch
…work…
git push -u origin feat/NN-slug
gh pr create --base <base> --title "feat: NN — <title>" --body "<template below>"
```

`NN` is the backlog number, zero-padded: `feat/04-challenge-domain`.

## Stack depth

Warn the user at **5 or more open PRs** and say which one is at the bottom waiting to be merged.
Do not refuse to continue — the depth is their call — but a deep stack means a bad decision low
down has been built on many times, and restacking after an out-of-order merge gets expensive.

## Restacking

If the user merges out of order, or squash-merges (which rewrites the commit and orphans every
branch above it), the stack is broken: PRs above will show a diff full of code that is already on
`main`. Run `/restack`. Never fix this with a force-push from a hand-written command — `/restack`
exists so the sequence is the same every time.

Every form of force-push is **denied** in `.claude/settings.json`, including `--force-with-lease`.
That is deliberate: force-pushing a branch that another branch is stacked on can destroy work.
`/restack` therefore does the whole repair — map, rebase, `npm run check`, verify each diff — and
then hands the user the exact push commands to run. The user pushes; Claude does not.

## Hard rules

- **Never commit on `main`. Never push to `main`. Never merge a PR** — `gh pr merge` is denied in
  settings and the user merges on GitHub.
- **Never force-push, never `reset --hard`, never `git clean`, never `commit --amend`** — all denied
  in settings. Amending a pushed branch breaks every PR stacked above it.
- **Stage by path.** Never `git add -A`, `git add .`, or `git commit -a`. Read `git status` and add
  exactly the files this feature touched.
- **A dirty tree stops the cycle.** `/ship-next` will not start on top of uncommitted work; it
  lists the files and stops.
- **`gh auth status` must show `baggelisp`** before any PR command. The work account
  `vspathonis-ip` is the machine default — if it is active, stop and tell the user to run
  `gh auth switch --user baggelisp`. Never open a PR on this repo from the work account.

## Commit messages

Conventional commits, imperative mood, scoped to the module:

```
feat(timers): derive elapsed minutes from a stored start timestamp

- calculateElapsedMinutes(startedAt, now) is pure and takes now as an argument
- workout and detox windows survive a force-quit; only startedAt is persisted
- interval in the screen only forces a re-render, it is never the source of truth

Refs Docs/backlog.md #09
```

End with the Claude attribution trailers the session provides. One commit per feature is the norm;
a second "address review" commit is fine. Noise that wants squashing is not.

## Pull request body — fill every section

```markdown
## Feature NN — <title>

Implements backlog item NN (Docs/backlog.md).
Stacked on: <base branch or main>  ·  Depth: <n> of <n>

### What
<2-4 bullets>

### Design notes
<the analyse-step decisions: approach chosen, one alternative rejected and why>

### Verification
- `npm run check`: <pass — tsc clean, N eslint findings, N tests passing>
- `reviewer` agent: <PASS / WARNINGS and what was done about each>
- `/live`: <screens exercised, console errors, screenshots attached>
- device-only, NOT verified in web: <camera / notifications / share sheet / document picker, or "none">

### Deferred / follow-ups
<anything consciously left out, or "none">
```

The "device-only" line is mandatory and never omitted. If a feature touches the camera, local
notifications, the native share sheet or the document picker, react-native-web cannot honour it and
the PR must say so plainly rather than implying a full pass.
