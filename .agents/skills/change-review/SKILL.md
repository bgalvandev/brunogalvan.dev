---
name: change-review
description: Review a local or branch diff for concrete correctness, regression, accessibility, configuration, and test risks. Use for code review and the final review pass of a non-trivial implementation; use design-review for visual critique and pr-ready for GitHub readiness.
allowed-tools: Bash(git status *), Bash(git diff *), Bash(git merge-base *), Bash(git rev-parse *)
---

# Change Review

Review the requested behavior against `AGENTS.md`, the diff, and its actual callers.
Use a separate read-only pass after implementation; no separate agent is required.

1. Inspect staged and unstaged changes, including untracked additions. For a
   branch review, compare against the merge base of the intended base branch.
   Exclude unrelated pre-existing changes.
2. Trace reachable failures: wrong links or metadata, build/server/browser boundary
   violations, locale or theme regressions, missing accessible names, unsafe
   scripts, CI commands that do not match package scripts, and broken skill paths.
3. Check tests for a distinct plausible failure mode. Do not request tests that
   merely duplicate implementation or documentation wording.
4. Try to disprove each finding using surrounding code and observed checks.
   Omit stylistic preferences and speculative future problems.
5. Report surviving findings by severity with file/line, impact, evidence, and
   the smallest correction. If none survive, state that and any unverified area.

Use P0 for immediate critical failure, P1 for likely major regressions, and P2
for localized reachable failures. Fix confirmed findings within the authorized
implementation task, then re-review only the affected changes. Stop when the
requested behavior and appropriate gates pass.

Related: [engineering-discipline](../engineering-discipline/SKILL.md), [design-review](../design-review/SKILL.md), [pr-ready](../pr-ready/SKILL.md).
