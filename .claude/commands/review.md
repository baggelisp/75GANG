---
description: Review the current branch diff (or a PR number) with the reviewer agent; escalate to the specialist panel when triggers fire.
---

# Review

Target: `$ARGUMENTS` if given (a PR number), else the diff of this feature against **its stack
base** — not against `main`:

```bash
BASE=$(gh pr view --json baseRefName --jq .baseRefName 2>/dev/null || echo origin/main)
git diff "origin/$BASE...HEAD"
```

plus untracked files. Reviewing against `main` in a stack shows the features below as well and
buries the real diff.

## 1. Single-pass gate

Dispatch the `reviewer` agent with the target. It returns PASS / WARNINGS / CRITICAL plus an
optional "Escalation recommended" line.

## 2. Escalate only when asked

Run the panel **only** if the reviewer recommended escalation, or the user asked for a "deep
review":

1. In parallel, one agent each: `correctness-reviewer`, `edge-case-hunter`,
   `test-coverage-analyst`, and `ux-reviewer` when the diff touches any component or theme file.
   Give each the diff plus only the cross-file context it references.
2. Collect every candidate finding. For each, dispatch `adversarial-verifier` with **only the claim
   and `file:line`** — never the finder's reasoning. Drop REFUTED. PLAUSIBLE below 0.7 confidence
   goes to "For human attention".
3. Merge survivors with the single-pass report, ranked by blast radius: lost user data / wrong
   streak or day / crash > broken habit completion > missing test on a risky path > style.

## 3. Report

Use the reviewer's report format verbatim. Every CRITICAL carries the empirical check that
confirmed it — a test run, a grep, or a reproduction. State clearly when the diff is clean.
