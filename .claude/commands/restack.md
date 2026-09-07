---
description: Repair the stacked PRs after an out-of-order or squash merge — map the stack, rebase each branch onto its new base, verify, and hand the user the force-push commands.
---

# Restack

Run this when the stack is broken: a PR was merged out of order, or squash-merged (which rewrites
the commit and orphans every branch above it). The symptom is a PR whose diff is full of code
already on `main`.

`$ARGUMENTS` may name the lowest branch to start from; otherwise start at the bottom of the stack.

## The force-push is the user's to run

Every form of force-push is denied in `.claude/settings.json` — deliberately. A force-push to a
branch that something else is stacked on can destroy work, and the deny is what stops that
happening on autopilot. So this command does **all** the work up to and including verification, and
then prints the exact `git push --force-with-lease` lines for the user to paste (with `!` in the
prompt, or in their own terminal).

Do not try to route around the deny. If the user wants this step automated, they can delete the
`git push --force*` entries from `.claude/settings.json` themselves — say so once, and only if they
ask why it stopped.

## 1. Map the stack — do not guess

```bash
git fetch origin --prune
gh pr list --state open --json number,headRefName,baseRefName,title --jq \
  '.[] | "PR #\(.number)  \(.headRefName)  <- base: \(.baseRefName)"'
git log --oneline origin/main -10
```

Before touching a branch, record for each one its current base commit:

```bash
git merge-base <branch> <its-current-base>
```

That commit is the `<old-base>` for the rebase. Take it from this command, never from memory —
getting it wrong silently drags a merged feature's commits back into the PR.

Write the chain out in your reply, bottom to top, say which link is broken and why (base branch
deleted, base merged, commits already on `main`), and **show the user this map before rebasing.**

## 2. Rebase each branch onto its new base, bottom-up

For each branch above the break, in order:

```bash
git switch <branch>
git rebase --onto <new-base> <old-base> <branch>
npm run check
```

`<new-base>` is `origin/main` for the branch whose base was merged, then the previous branch in the
stack for each one above it.

If a rebase conflicts: resolve it, `git rebase --continue`, then **rerun `npm run check`**. If it
conflicts in a way you cannot resolve with confidence, `git rebase --abort` and stop with the
conflicting files listed. A guessed conflict resolution silently corrupts a feature.

## 3. Verify before handing anything over

For each rebased branch:

```bash
git log --oneline <new-base>..<branch>     # only this feature's commits, nothing from main
git diff <new-base>...<branch> --stat      # only this feature's files
```

If a branch still carries commits or files from a merged feature, the rebase used the wrong
`<old-base>`. Say so and stop — do not hand the user a push command for a branch you have not
verified.

## 4. Hand over the push commands

Print them as one block, in bottom-to-top order, with the retarget alongside each:

```bash
git push --force-with-lease origin feat/02-theme
gh pr edit 2 --base main

git push --force-with-lease origin feat/03-storage
gh pr edit 3 --base feat/02-theme
```

`--force-with-lease`, never `--force`: it refuses if the remote moved under you. Order matters —
pushing a branch before the one below it leaves the PR pointing at a base that does not exist yet.

## 5. Report

The repaired chain bottom to top, each PR's new base, what `npm run check` said for each branch,
anything resolved by hand during a rebase, and the push block from step 4. Tell the user the local
branches are correct and only the push is outstanding.
