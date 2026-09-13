---
name: local-development
description: Start, stop, or troubleshoot this Astro site, dependencies, port conflicts, and production browser tests. Use for local runtime tasks.
---

# Local Development

This repository is one Astro application. It currently requires no database,
Docker or environment secrets. Run commands from the repository root.

1. Inspect branch/worktree and pinned Node/pnpm versions before changes.
2. Install with `pnpm install --frozen-lockfile`.
3. `pnpm run dev` listens on `127.0.0.1:3000`; keep its session alive and verify
   `/es/` and `/en/` respond before reporting a working URL.
4. Inspect the owner of an occupied port. Never kill an unrelated listener.
   Stop only the process/session started for this task when asked to close it.
5. For build-output problems, verify ownership before removing generated `.astro`
   or `dist`. Preserve source and unrelated application caches.

`pnpm run preview` serves an existing production build on port 3100.
`pnpm run test:e2e` manages build/preview automatically and requires that port free.
Avoid simultaneous builds replacing `dist`. See [frontend-e2e](../frontend-e2e/SKILL.md) for browser setup.
Report observed HTTP status and errors; a live process alone proves no page works.

Astro 7 may auto-background CLI servers in agent environments. Verify ownership
with `pnpm exec astro dev status` or `pnpm exec astro preview status`; stop the
owned instance with the matching `stop` command. Do not assume the initiating
terminal stays alive. Test preview uses an explicit foreground lifecycle wrapper.
