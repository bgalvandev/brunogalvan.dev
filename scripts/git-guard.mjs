// Git guard: a Claude Code `PreToolUse` hook on Bash, registered in
// `.claude/settings.json` (AGENTS.md rule 19).
//
// Agent sessions run without permission prompts, so a written rule alone stops
// nothing. Before a command runs, the guard denies what AGENTS.md reserves for
// the maintainer's explicit approval, what discards uncommitted work, and
// `git stash`, whose single list every worktree of the repository shares. A
// command the maintainer approved in the current conversation is prefixed with
// `APPROVED=1` and passes. When the guard itself fails it lets the command
// through: a broken guard must not stop the session.
import { realpathSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const approval = 'APPROVED=1';
const approvalHint = `Run it only when the maintainer approved this operation in this conversation, and then prefix the command with ${approval}.`;
const shells = new Set(['sh', 'bash', 'zsh', 'dash']);
const shellKeywords = new Set([
  '!',
  '{',
  '}',
  'if',
  'then',
  'else',
  'elif',
  'do',
  'while',
  'until',
  'command',
  'exec',
  'nohup',
  'time',
]);
// Wrappers that run the next program, and their options that take a value.
const wrappers = new Set(['env', 'nice', 'sudo', 'timeout']);
const wrapperOptionsWithValue = new Set(['-u', '-n', '-g', '-s', '-k']);
// Global git options whose value is the next word (`git -C <dir> push`).
const gitOptionsWithValue = new Set([
  '-C',
  '-c',
  '--git-dir',
  '--work-tree',
  '--namespace',
]);
const pushOptionsWithValue = new Set([
  '-o',
  '--push-option',
  '--repo',
  '--receive-pack',
  '--exec',
]);

// Splits shell text into simple commands, each a list of words. Quotes and
// backslashes are honoured, `#` starts a comment, and `;`, `&`, `|`,
// parentheses and newlines end a command; expansions stay literal text.
function simpleCommands(text) {
  const commands = [];
  let words = [];
  let word = '';
  let inWord = false;
  let quote = '';
  const endWord = () => {
    if (inWord) {
      words.push(word);
    }
    word = '';
    inWord = false;
  };
  const endCommand = () => {
    endWord();
    if (words.length > 0) {
      commands.push(words);
    }
    words = [];
  };
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quote === "'") {
      if (char === "'") {
        quote = '';
      } else {
        word += char;
      }
    } else if (quote === '"') {
      if (char === '"') {
        quote = '';
      } else if (char === '\\' && '"\\$`'.includes(text[i + 1] ?? '')) {
        word += text[i + 1];
        i += 1;
      } else {
        word += char;
      }
    } else if (char === "'" || char === '"') {
      quote = char;
      inWord = true;
    } else if (char === '\\') {
      if (i + 1 < text.length && text[i + 1] !== '\n') {
        word += text[i + 1];
        inWord = true;
      }
      i += 1;
    } else if (char === '#' && !inWord) {
      while (i + 1 < text.length && text[i + 1] !== '\n') {
        i += 1;
      }
    } else if (char === '\n' || ';&|()'.includes(char)) {
      endCommand();
    } else if (/\s/.test(char)) {
      endWord();
    } else {
      word += char;
      inWord = true;
    }
  }
  endCommand();
  return commands;
}

// Drops what runs before the program (shell keywords, variable assignments,
// wrappers such as `env` or `sudo`) and reports whether the command carries
// the approval marker among its own assignments.
function parseSimpleCommand(words) {
  let approved = false;
  let i = 0;
  while (i < words.length) {
    const word = words[i];
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(word)) {
      approved ||= word === approval;
      i += 1;
    } else if (shellKeywords.has(word)) {
      i += 1;
    } else if (wrappers.has(path.basename(word))) {
      i += 1;
      while (
        i < words.length &&
        (words[i].startsWith('-') || /^\d/.test(words[i]))
      ) {
        i += wrapperOptionsWithValue.has(words[i]) ? 2 : 1;
      }
    } else {
      break;
    }
  }
  const [program = '', ...args] = words.slice(i);
  return { approved, name: path.basename(program), args };
}

// Options before a `--` separator; the words after it are paths.
function optionsOf(args) {
  const end = args.indexOf('--');
  return (end === -1 ? args : args.slice(0, end)).filter((arg) =>
    arg.startsWith('-'),
  );
}

// Whether the options hold the long form, or the short letter alone or in a
// cluster such as `-fd`.
function hasOption(options, long, short) {
  return options.some(
    (option) =>
      option === long ||
      option.startsWith(`${long}=`) ||
      (short !== undefined &&
        /^-[A-Za-z]+$/.test(option) &&
        option.includes(short)),
  );
}

function pushReason(args) {
  const options = optionsOf(args);
  if (
    hasOption(options, '--force', 'f') ||
    hasOption(options, '--force-with-lease')
  ) {
    return '`git push --force` rewrites published history';
  }
  if (
    hasOption(options, '--delete', 'd') ||
    hasOption(options, '--prune') ||
    hasOption(options, '--mirror')
  ) {
    return '`git push --delete`, `--prune` or `--mirror` deletes remote branches or tags';
  }
  const positional = [];
  for (let i = 0; i < args.length; i += 1) {
    if (pushOptionsWithValue.has(args[i])) {
      i += 1;
    } else if (!args[i].startsWith('-')) {
      positional.push(args[i]);
    }
  }
  // The first positional word is the remote; the rest are refspecs.
  for (const refspec of positional.slice(1)) {
    if (refspec.startsWith('+')) {
      return 'a `+<ref>` refspec force-pushes published history';
    }
    if (refspec.startsWith(':')) {
      return 'a `:<ref>` refspec deletes a remote branch or tag';
    }
  }
  return null;
}

const gitChecks = new Map([
  [
    'reset',
    (args) =>
      hasOption(optionsOf(args), '--hard')
        ? '`git reset --hard` discards uncommitted work'
        : null,
  ],
  [
    'clean',
    (args) => {
      const options = optionsOf(args);
      return hasOption(options, '--force', 'f') &&
        !hasOption(options, '--dry-run', 'n')
        ? '`git clean -f` deletes untracked files'
        : null;
    },
  ],
  ['push', pushReason],
  [
    'checkout',
    (args) =>
      args.includes('--') ||
      args.includes('.') ||
      hasOption(optionsOf(args), '--force', 'f')
        ? '`git checkout` of paths or with `--force` discards uncommitted changes'
        : null,
  ],
  [
    'switch',
    (args) => {
      const options = optionsOf(args);
      return hasOption(options, '--discard-changes') ||
        hasOption(options, '--force', 'f')
        ? '`git switch --discard-changes` discards uncommitted changes'
        : null;
    },
  ],
  [
    'restore',
    (args) => {
      const options = optionsOf(args);
      return hasOption(options, '--worktree', 'W') ||
        !hasOption(options, '--staged', 'S')
        ? '`git restore` of the working tree discards uncommitted changes'
        : null;
    },
  ],
  [
    'stash',
    (args) =>
      ['list', 'show'].includes(args.find((arg) => !arg.startsWith('-')))
        ? null
        : '`git stash` keeps one list for every worktree of the repository, so another session can pop or drop these changes; commit them to the branch instead',
  ],
  [
    'tag',
    (args) =>
      hasOption(optionsOf(args), '--delete', 'd')
        ? '`git tag -d` deletes a tag'
        : null,
  ],
  [
    'rebase',
    (args) =>
      hasOption(optionsOf(args), '--interactive', 'i')
        ? '`git rebase -i` rewrites history'
        : null,
  ],
]);

function gitReason(args) {
  let i = 0;
  while (i < args.length && args[i].startsWith('-')) {
    i += gitOptionsWithValue.has(args[i]) ? 2 : 1;
  }
  const check = gitChecks.get(args[i]);
  return check ? check(args.slice(i + 1)) : null;
}

function ghReason(args) {
  if (args[0] === 'repo' && args[1] === 'delete') {
    return '`gh repo delete` deletes the repository';
  }
  if (args[0] === 'api') {
    for (let i = 1; i < args.length; i += 1) {
      const method =
        args[i] === '-X' || args[i] === '--method'
          ? args[i + 1]
          : /^(?:-X|--method=)(.+)$/.exec(args[i])?.[1];
      if (method?.toUpperCase() === 'DELETE') {
        return '`gh api` with DELETE deletes on GitHub';
      }
    }
  }
  return null;
}

// Returns why the command needs the maintainer's approval, or null when it may
// run. `bash -c '<script>'` is checked as the script it runs.
export function denialReason(command, depth = 0) {
  for (const words of simpleCommands(command)) {
    const { approved, name, args } = parseSimpleCommand(words);
    if (approved) {
      continue;
    }
    let reason = null;
    if (shells.has(name) && depth < 3) {
      const flag = args.findIndex((arg) => /^-[A-Za-z]*c[A-Za-z]*$/.test(arg));
      if (flag !== -1 && args[flag + 1] !== undefined) {
        reason = denialReason(args[flag + 1], depth + 1);
      }
    } else if (name === 'git') {
      reason = gitReason(args);
    } else if (name === 'gh') {
      reason = ghReason(args);
    }
    if (reason) {
      return reason;
    }
  }
  return null;
}

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }
  const { tool_name: tool, tool_input: toolInput } = JSON.parse(input);
  if (tool !== 'Bash' || typeof toolInput?.command !== 'string') {
    return;
  }
  const reason = denialReason(toolInput.command);
  if (reason) {
    const decision = {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: `${reason}. ${approvalHint}`,
      },
    };
    process.stdout.write(`${JSON.stringify(decision)}\n`);
  }
}

function runAsHook() {
  try {
    return (
      realpathSync(process.argv[1] ?? '') === fileURLToPath(import.meta.url)
    );
  } catch {
    return false;
  }
}

if (runAsHook()) {
  main().catch(() => {});
}
