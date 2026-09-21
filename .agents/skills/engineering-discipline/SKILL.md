---
name: engineering-discipline
description: Working protocol for any non-trivial change in this repository: verify before claiming, smallest correct change, run the gates before declaring done. Use at the start of an implementation task and before reporting it finished.
allowed-tools: Bash(pnpm run check), Bash(pnpm run lint), Bash(pnpm run typecheck), Bash(pnpm run test), Bash(pnpm run test:e2e), Bash(pnpm run build), Bash(node scripts/e2e/preview.mjs)
---

# Engineering discipline

1. **Evidence before claims.** Confirm a function, export, option or flag exists
   by reading the file, `package.json` or the official docs before using it.
   Before saying a check passes, run it and read the output; report failures as
   they happened. State an assumption explicitly instead of picking one silently.
2. **Smallest correct change.** The narrowest code path that satisfies the
   requirement, matching the surrounding conventions. No structure for a future
   that has not arrived.
3. **Map the impact before editing.** Name what changes (a message key, a route
   pair, a token, a component) and grep it across `src`, `e2e`, `scripts` and
   `docs` before touching it: both catalogs, `routes.ts`, the tests that name it
   and the architecture notes. `astro check` and the parity test close the map
   for keys and types; nothing else in this site is implicit. After editing, grep
   the old name once more and account for every hit.
4. **Order of work.** Content and data first, then the components that render
   them, then the route that composes them, with tests alongside. Review the diff
   for accidental complexity before declaring done.
5. **Done means green and seen.** `pnpm run check` and, for visible or
   configuration changes, `pnpm run test:e2e`. A failing gate is fixed at its
   cause; the gate is never weakened, the test never deleted, no ignore added to
   turn red green. Then confirm the change in the production build: `pnpm run
build && node scripts/e2e/preview.mjs`, open the pages in a real browser,
   take one capture per changed state into the session scratch directory (the
   e2e suite already writes captures at three widths and two themes), and look
   at them yourself. The pull request names the capture paths and what was not
   exercised.
6. **A reported failure.** Reproduce it in the production build before touching
   code, change one thing at a time until the failure appears and disappears
   with it, then fix with a test that fails before and passes after. Say whether
   it was a defect or the site working as designed.
7. **Recovery.** A retry needs new evidence or a different strategy. After two
   failures with the same apparent cause, reassess the original evidence. Stop
   refining when the requested behavior and the gates pass, and report an
   external blocker precisely when no in-scope approach remains.
