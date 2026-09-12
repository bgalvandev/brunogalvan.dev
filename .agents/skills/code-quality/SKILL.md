---
name: code-quality
description: Run and interpret the duplication and dead-code gates (jscpd + knip), and apply DRY/extraction the right way. Use before finishing a change, when `pnpm run check` fails on dead-code/dupes, or when you are about to copy-paste code.
allowed-tools: Bash(pnpm run dead-code), Bash(pnpm run dupes), Bash(pnpm exec knip*), Bash(pnpm exec jscpd*)
---

# Code Quality: duplication + dead code

Two gates run inside `pnpm run check` and **block** on failure:

| Script               | Tool  | Catches                                  | Config                         |
| -------------------- | ----- | ---------------------------------------- | ------------------------------ |
| `pnpm run dead-code` | knip  | unused files, exports, dependencies      | `knip.json`                    |
| `pnpm run dupes`     | jscpd | copy-pasted code (≥80 tokens / 10 lines) | `.jscpdrc.json` + script flags |

## Fixing knip findings (dead code)

- **Unused export** → remove the `export` keyword if it is only used in-file, or
  delete the symbol if nothing uses it. Do not keep "just in case" exports.
- **Unused file** → delete it, or (if it is a real entry the tool can't trace, e.g.
  an Astro route or a config) add it to the right `entry` array in
  `knip.json`.
- **Unused dependency** → remove it from `package.json`. If it is genuinely used but
  only via a config/preset/CLI/runtime-string knip cannot import-trace (e.g. an
  ESLint preset plugin), add it to `ignoreDependencies` in `knip.json` **with that
  justification in the PR** — never to silence a real removal.

## Fixing jscpd findings (duplication)

The `dupes` script runs jscpd over `src` and `scripts`. The **threshold** is the maximum
percentage of duplicated code jscpd tolerates before failing (exit 1). It is set to
`0` — zero tolerance: any clone of ≥80 tokens / 10 lines in non-test source fails the
gate. The script passes the config path and threshold explicitly, and excludes
spec/test files. When a clone is
reported, extract the shared logic to where it belongs:

- Shared UI → a component in `src/components/**`.
- Shared data/content → the owning feature module.
- Shared pure helper → a named module in the owning shared responsibility.
- Do **not** create a generic `utils.ts`/`helpers.ts` dumping ground, and do not add
  an abstraction for a single future caller. Extract only what is duplicated _now_.

Some repetition is fine and should not be DRY-ed: test arrange/act blocks (already
ignored), and incidental similarity that isn't the same concept.

## Verification

- `pnpm run dead-code` exits 0 (knip).
- `pnpm run dupes` exits 0 (jscpd: "Found 0 clones").
- Any new `ignoreDependencies`/`entry`/`--ignore` addition is justified in the PR.

Related: [[frontend-architecture]], [[engineering-discipline]].

`pnpm run architecture:check` additionally validates feature layers and transitive
browser dependencies. Its parser supports Astro scripts and TypeScript import syntax.
The clone window is 80 tokens / 10 lines to detect substantive duplicated blocks
without forcing abstractions from short structural markup; threshold remains zero.
