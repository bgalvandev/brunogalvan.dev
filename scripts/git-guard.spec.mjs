import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { denialReason } from './git-guard.mjs';

const guard = fileURLToPath(new URL('./git-guard.mjs', import.meta.url));

// Runs the real hook the way Claude Code does: the tool call as JSON on stdin,
// the decision as JSON on stdout.
function runHook(input) {
  return spawnSync(process.execPath, [guard], {
    input: typeof input === 'string' ? input : JSON.stringify(input),
    encoding: 'utf8',
  });
}

test('denies what needs the maintainer approval', () => {
  for (const command of [
    'git reset --hard',
    'git reset --hard origin/main',
    'git clean -fdx',
    'git clean --force -d',
    'git push --force',
    'git push -f origin feat/x',
    'git push --force-with-lease origin feat/x',
    'git push origin +feat/x',
    'git push origin --delete feat/x',
    'git push -d origin v1.0.0',
    'git push origin :feat/x',
    'git push --mirror',
    'git tag -d v1.0.0',
    'git rebase -i main',
    'git checkout -- src/a.ts',
    'git checkout main -- src/a.ts',
    'git checkout .',
    'git checkout -f main',
    'git switch --discard-changes main',
    'git restore src/a.ts',
    'git restore .',
    'git restore --staged --worktree src/a.ts',
    'git stash',
    'git stash push -m wip',
    'git stash pop',
    'gh repo delete owner/repo --yes',
    'gh api -X DELETE repos/{owner}/{repo}/git/refs/heads/feature',
    'gh api --method DELETE repos/{owner}/{repo}/git/refs/heads/feature',
  ]) {
    assert.equal(typeof denialReason(command), 'string', command);
  }
});

test('finds the git command behind shell syntax', () => {
  for (const command of [
    'cd src && git reset --hard',
    'git status; git reset --hard',
    'git -C ../other push --force',
    'env GIT_TRACE=1 git push --force',
    'FOO=1 git stash',
    '(git stash)',
    "bash -lc 'git clean -fd'",
    'sudo git clean -fd',
    '/usr/bin/git reset --hard',
  ]) {
    assert.equal(typeof denialReason(command), 'string', command);
  }
});

test('allows what keeps work and history', () => {
  for (const command of [
    'git status',
    'git push -u origin feat/x',
    'git push --follow-tags origin feat/x',
    'git reset HEAD~1',
    'git reset --soft HEAD~1',
    'git clean -n -d',
    'git clean -fdn',
    'git checkout feat/x',
    'git checkout -b feat/x origin/main',
    'git switch -c feat/x',
    'git restore --staged src/a.ts',
    'git stash list',
    'git stash show -p stash@{0}',
    'git branch -D feat/x',
    'git tag v1.0.0',
    'git rebase origin/main',
    'git commit -m "docs: explain git reset --hard and git stash"',
    "echo 'git push --force'",
    'gh api repos/{owner}/{repo}/pulls',
    'gh pr merge 12 --squash --subject "chore: x (#12)" --body ""',
  ]) {
    assert.equal(denialReason(command), null, command);
  }
});

test('the approval marker passes only the command it prefixes', () => {
  for (const command of [
    'APPROVED=1 git reset --hard',
    'APPROVED=1 git push --force-with-lease origin feat/x',
    "APPROVED=1 bash -c 'git stash'",
  ]) {
    assert.equal(denialReason(command), null, command);
  }
  for (const command of [
    'APPROVED=1 git status && git reset --hard',
    'git commit -m "APPROVED=1" && git reset --hard',
    'NOT_APPROVED=1 git reset --hard',
    'APPROVED=10 git reset --hard',
  ]) {
    assert.equal(typeof denialReason(command), 'string', command);
  }
});

test('answers a denied Bash command with a deny decision and its reason', () => {
  const result = runHook({
    tool_name: 'Bash',
    tool_input: { command: 'git reset --hard' },
  });
  assert.equal(result.status, 0);
  const { hookSpecificOutput } = JSON.parse(result.stdout);
  assert.equal(hookSpecificOutput.hookEventName, 'PreToolUse');
  assert.equal(hookSpecificOutput.permissionDecision, 'deny');
  assert.match(
    hookSpecificOutput.permissionDecisionReason,
    /git reset --hard.*APPROVED=1/s,
  );
});

test('stays silent and exits 0 for allowed commands, other tools and unreadable input', () => {
  for (const input of [
    { tool_name: 'Bash', tool_input: { command: 'git status' } },
    { tool_name: 'Edit', tool_input: { file_path: 'a.ts' } },
    'not json',
  ]) {
    const result = runHook(input);
    assert.equal(result.status, 0);
    assert.equal(result.stdout, '');
  }
});
