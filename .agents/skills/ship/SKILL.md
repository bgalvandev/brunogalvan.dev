---
name: ship
description: Take a change from the working tree to main — pre-commit checks (branch, author identity, staged diff, formatting, Conventional Commits subject, no attribution trailers), pull-request readiness (PR head equals the local tip, ancestry against the PR's own base, merge state, required checks from branch protection and rulesets), the squash merge, and local branch cleanup. Use before every commit, before reporting a PR ready, and when merging one.
allowed-tools: Bash(git branch *), Bash(git status *), Bash(git diff *), Bash(git log *), Bash(git config user.name), Bash(git config user.email), Bash(git fetch *), Bash(git merge-base *), Bash(git rev-parse *), Bash(git switch main), Bash(git pull --ff-only *), Bash(pnpm run format), Bash(pnpm run format:check), Bash(gh api repos/{owner}/{repo}/branches/*/protection/required_status_checks --jq .contexts), Bash(gh api repos/{owner}/{repo}/rules/branches/* --jq *), Bash(gh pr view *), Bash(gh pr checks *)
---

# Ship: from commit to merged

Enforces AGENTS.md "Git and CI" (rules 13 and 14). Run every check explicitly: a command
shown here is an instruction, not proof that it ran. Report any failing check
and stop until it is resolved.

Current branch when this skill loaded: !`git branch --show-current`

## Before a commit

1. Not on a protected branch: `git branch --show-current` is neither `main` nor
   a release branch. Otherwise stop and create a working branch first.
2. Author identity: `git config user.name && git config user.email` shows the
   contributor's intended public identity for this repository. A corporate or
   tool-session account MUST NOT author commits; if the identity is unset or
   wrong, stop and confirm it with the contributor instead of guessing.
3. Staged content: `git status --short && git diff --cached --stat` contains one
   logical change and nothing unrelated.
4. Formatting: `pnpm run format:check` passes; otherwise run `pnpm run format`
   and restage the result.
5. Header `<type>[optional scope]: <description>` per Conventional Commits
   1.0.0: type in `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `build`,
   `ci`, `chore`, `revert`; scope a site area (`stack`, `mobile`, `type`, `agents`)
   or omitted; `!` and a `BREAKING CHANGE:` footer for a breaking change; a
   concise English subject that reads cleanly as the future squash subject.
6. No authorship or AI-attribution trailers: no `Co-authored-by:` lines and no
   generated-with badges in the message, the PR title, or the PR description.
7. No `WIP`/`tmp` messages on shared branches.

Examples: `fix(stack): time each diagram loop again`,
`feat(mobile): add the phone header`, `docs: record the hosting decision`.

## Before reporting a PR ready

`<n>` is the PR number: the skill argument (`$0`) when given, otherwise
`gh pr view --json number`.

1. Resolve the PR:
   ```bash
   gh pr view <n> --json number,url,baseRefName,headRefName,headRefOid,mergeStateStatus,statusCheckRollup
   ```
2. Compare after `git fetch origin`:
   - `git rev-parse <headRefName>` equals `headRefOid`. Otherwise GitHub is
     checking different code from the code you reviewed: a local commit was
     never pushed, or someone pushed from elsewhere.
   - `git merge-base --is-ancestor origin/<baseRefName> <headRefOid>` succeeds.
     Use the PR's own base, not `main` by default: a stacked PR targets another
     branch. A stale branch is updated by merging `origin/<baseRefName>` (never
     a force push), and the checks restart from step 1.
3. Read the required checks of that base from both sources GitHub enforces:
   ```bash
   gh api repos/{owner}/{repo}/branches/<baseRefName>/protection/required_status_checks --jq .contexts
   gh api repos/{owner}/{repo}/rules/branches/<baseRefName> --jq '[.[] | select(.type == "required_status_checks") | .parameters.required_status_checks[].context]'
   ```
   A 404 `Branch not protected` means no classic protection, and an empty rules
   list means no ruleset. Any other error (permissions, rate limit, network)
   leaves the requirements unknown, and unknown is not ready.
4. Interpret strictly:
   - `DIRTY` is a conflict; `BEHIND` means update (step 2); `UNKNOWN` means
     re-query and wait; `BLOCKED` with passing checks goes to step 5.
   - `statusCheckRollup == null` means the checks have not registered, so do
     not claim they are running.
   - Any queued, in-progress, pending, failed, errored, cancelled, timed-out, or
     action-required check is not ready, even when protection does not require
     it.
   - Every required context appears and succeeds. A skipped job counts only
     when its workflow condition explains the skip (a scope job that found
     nothing to run); a required job skipped for any other reason is not
     evidence that its validation ran.
5. If GitHub says "Merging is blocked" while required checks pass, do not add
   unrelated code to clear it: inspect branch protection and rulesets,
   unresolved review threads, and code-scanning conversations in that order;
   fix true positives and dismiss false positives with a written justification
   in the thread.
6. Report the PR URL, the exact head SHA, base ancestry, merge state, required
   contexts, and each check's conclusion. Report ready only when all of it
   agrees.

## Squash merge

Readiness does not authorize a merge: merge only when the maintainer asked for
it. Pass the subject and body explicitly:

```bash
gh pr merge <n> --squash --subject "<type>[scope]: <description> (#<n>)" --body ""
```

The empty `--body` is load-bearing: without it GitHub generates a body with
`Co-authored-by:` trailers whenever a branch commit's author differs from the
merging account.

## After the merge

GitHub deletes the remote head branch on merge; the local one stays behind.
A squash merge leaves it outside `main`'s ancestry, so `git branch -d` refuses
it and `-D` is needed. Confirm first that nothing local is lost:

```bash
gh pr view <n> --json state,headRefName,headRefOid   # state is MERGED
git rev-parse <headRefName>                          # equals headRefOid
git switch main && git pull --ff-only --prune
git branch -D <headRefName>
```

If the tip differs, the branch holds commits the PR never had: keep it and
report them instead of deleting.

Related: [engineering-discipline](../engineering-discipline/SKILL.md).
