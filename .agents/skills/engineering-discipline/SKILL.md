---
name: engineering-discipline
description: The working protocol for any non-trivial change in the portfolio — verify before claiming, no hallucinated APIs, smallest correct solution, and run the gates before declaring done. Use at the start of an implementation task and before reporting it finished.
allowed-tools: Bash(pnpm run check), Bash(pnpm run lint), Bash(pnpm run typecheck), Bash(pnpm run test), Bash(pnpm run test:e2e)
---

# Engineering Discipline

The goal: one clear line of reasoning to the best solution — no guessing, no
hallucinated APIs, no speculative scaffolding. This skill is the default operating
protocol; the topic skills ([frontend-architecture](../frontend-architecture/SKILL.md), [frontend-performance](../frontend-performance/SKILL.md),
[code-quality](../code-quality/SKILL.md), [frontend-design](../frontend-design/SKILL.md)) cover specifics.

## 1. Ground every claim in evidence

- Before using a function, type, package export, config flag, or CLI option,
  **confirm it exists** — read the file, check `package.json`, or check official
  docs. Do not invent names or assume an API shape from memory.
- Before asserting something works ("tests pass", "the build is green", "this
  fixes it"), **run the command and read the output**. Report what actually
  happened, including failures — never claim a result you did not observe.
- When unsure between two readings of the requirement, ask or state the assumption
  explicitly; do not silently pick one and build on it.

## 2. Smallest correct change

- Use the smallest code path and surface that satisfies the requirement while
  preserving the architecture.
- Do **not** add abstractions, adapters, services, or shared utilities for
  speculative future reuse. Add structure only when the current behavior needs it.
- Match the surrounding code: naming, file conventions, comment density, and test
  style.

## 3. Respect the architecture

- Follow `docs/architecture.md` and [frontend-architecture](../frontend-architecture/SKILL.md) for dependency direction.
- Routes compose; features own behavior; shared UI does not import features.
- Follow [backend-architecture](../backend-architecture/SKILL.md) when concrete I/O requires ports and adapters.
- Keep files focused and browser dependencies separate from server capabilities.

## 4. Change workflow

1. Identify the target route/component/content and where it lives under `src`.
2. Change the content/data first when behavior changes, then the components that
   render it, then the route that composes them. Add/adjust tests alongside.
3. Review the diff for unnecessary complexity and run [change-review](../change-review/SKILL.md) as a
   separate pass for non-trivial work.
4. Verify before declaring done.

## 5. Definition of done (run these, read the output)

- Local gate before merge: `pnpm run check` (formatting, skill validation, tool tests, lint, typecheck,
  test, build, dead-code, dupes) — all green.
- For narrower iteration, run the affected pieces directly: `pnpm run lint`,
  `pnpm run typecheck`, `pnpm run test`.
- For commits use the [commit-check](../commit-check/SKILL.md) skill.

If a gate fails, fix the cause — do not weaken the gate, delete the test, or add an
ignore to make red turn green. Justify any genuinely-needed config exception in the
PR.

## Recovery and completion

A retry must use new evidence or a different strategy. After two failures with the
same apparent cause, reassess the original evidence before another attempt. Do
not mask failures by weakening gates or expanding scope. Stop refinement when the
requested behavior, relevant gates, and review pass; report external blockers
precisely when no materially different in-scope approach remains.
