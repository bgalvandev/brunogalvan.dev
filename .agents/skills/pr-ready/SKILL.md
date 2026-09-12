---
name: pr-ready
description: Verify an existing pull request before reporting it ready or mergeable, checking current ancestry, GitHub merge state, required checks, and all reported conclusions. Use only after a PR exists.
allowed-tools: Bash(git fetch *), Bash(git merge-base *), Bash(git rev-parse *), Bash(git status *), Bash(gh api *), Bash(gh pr view *), Bash(gh pr checks *)
---

# Pull Request Readiness

Run these checks explicitly. Commands shown in a skill are instructions, not proof
that any shell command has already executed.

1. Resolve the PR number and base/head branches with `gh pr view --json
number,url,baseRefName,headRefName,headRefOid,mergeStateStatus,statusCheckRollup`.
2. Fetch origin. Verify the reviewed local HEAD matches the PR head, and the latest
   remote base is an ancestor of that head using `git merge-base --is-ancestor`.
   Update a stale branch without discarding work, then repeat the checks.
3. Read required checks from the actual base branch protection and applicable
   repository rulesets using `gh api`. Do not hard-code job names or interpret
   permission/API errors as absence of requirements.
4. Inspect all reported checks. Missing/null, queued, in-progress, pending, failed,
   cancelled, timed-out, or action-required checks do not establish readiness.
   Every required context must appear and succeed. A skipped optional job is
   acceptable only when its workflow condition is understood; a required skipped
   job is not evidence that its validation ran.
5. A `DIRTY`, `UNKNOWN`, `BEHIND`, or blocked merge state is not ready. Investigate
   actual checks, protections, and review threads; do not add unrelated code to
   clear a repository setting.
6. Report PR URL, exact head, base ancestry, merge state, required contexts, and
   observed check conclusions. Report readiness only when the evidence agrees.

Opening a draft PR does not require already having a PR. Review the local diff
and applicable checks first; use this skill once the PR exists. Readiness does
not itself authorize merging.

Related: [[commit-check]], [[change-review]], [[engineering-discipline]].
