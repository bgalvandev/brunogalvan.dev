# AGENTS.md

## Scope

This document is the engineering standard for this repository — the
website at `brunogalvan.dev`. It applies to all contributors (human and AI) and all
CI workflows. It holds **always-on standing rules**. Repeatable _procedures_ live in
skills under `.agents/skills/**` and are referenced from here, not restated.

The key words **MUST, MUST NOT, SHOULD, SHOULD NOT, MAY** are interpreted per BCP 14
(RFC 2119, RFC 8174) when in all capitals.

### Precedence

1. Direct system/developer/user instructions override this file.
2. This standard is evolvable, not frozen: when a better tool or pattern supersedes a
   rule, update the affected rule in the **same** change rather than working around it
   silently. Silent drift between a rule and the actual practice is the only thing
   forbidden.
3. Follow the nearest applicable `AGENTS.md`; an `AGENTS.override.md` takes
   precedence at the same level. Nested instructions contain only local differences.

### Writing instructions

Rules MUST be scoped, actionable, and verifiable in this website. Procedures
belong in skills. Keep tool entry files minimal and correct obsolete instructions
in the change that makes them obsolete. Verification: `pnpm run ai:guard` and
`git diff --check` pass; review checks instructions against actual scripts and paths.

## Language Standard

All technical artifacts (code comments, commit messages, PR descriptions, docs) MUST
be written in English by default. Product/content copy on the site MAY be in any
language the design calls for.

## Project Identity and Documentation Provenance

Scope: site content, metadata, contact links, repository instructions, skills,
ADRs, comments, technical documentation, commits, issues, and PR descriptions.

1. The public identity MUST be Bruno Galván at `brunogalvan.dev`. The approved
   contact email MUST be `brunogalvangarcia@outlook.com` in visible text and links.
2. Contributors MUST NOT infer contact details, employers, affiliations, client
   relationships, or endorsements from another project, account, or template.
   Additional public identities or project/client mentions require explicit user
   authorization and verified content.
3. Technical artifacts MUST explain decisions in this website's terms: context,
   alternatives, rationale, consequences, and verification.
4. Artifacts MUST NOT attribute project work or design decisions to an external
   individual, course, tutorial, repository, reference gallery, product, brand,
   or discovery path. Visual rationale MUST describe this site's objectives.
5. Necessary identifiers for adopted dependencies, evaluated tools, standards,
   licenses, security advisories, interoperability, and authorized profile links
   MAY be included. Required license notices and factual citations MUST remain
   accurate; these exceptions MUST NOT imply an affiliation or endorsement.
6. External research notes, browsing history, and reference captures MUST remain
   untracked. When adapting material, contributors MUST review names, domains,
   email addresses, examples, and links before retaining them.

Verification: review source, catalogs, metadata, tests, docs, and skills for
unapproved identity or provenance references. `pnpm run ai:guard` rejects email
literals other than the approved contact in product source/content. Browser tests
verify the visible contact and mail destination. The email check is lexical;
reviewers still inspect other names, links, and dynamically assembled content.

## Stack Baseline

- Astro 7, static output by default, strict TypeScript, Tailwind CSS v4.
- Astro components render HTML; browser scripts enhance real interactions.
- Node version is pinned in `.nvmrc`; pnpm in `package.json`. Use Corepack and
  `pnpm install --frozen-lockfile` in CI. Never edit the lockfile manually.
- Vitest tests pure logic; Playwright tests production HTML and accessibility.
- Deployment is host-independent static `dist/` today. Runtime capabilities need
  an explicit adapter and hosting decision; see `docs/architecture.md`.

## Architecture Standard

Scope: `src/**`. Procedures: `astro-development`, `frontend-architecture`,
`backend-architecture`. The dependency contract is in `docs/architecture.md`.

1. `src/pages` contains routing and composition; `src/layouts` owns the document;
   `src/components` contains shared UI. Features live in `src/modules/<feature>`.
2. Presentation-only features MAY keep files directly in the feature folder.
   Introduce explicit layers when responsibilities require separation. Within
   a layered feature, domain is pure, application coordinates domain through ports,
   infrastructure implements I/O, and interface presents/validates inputs.
   Create a layer when it has a responsibility; do not fill empty directories.
3. Shared code MUST NOT depend on features or pages. Features MUST NOT import
   another feature's internals. Composition roots wire adapters into use cases.
4. Domain MUST NOT import framework, I/O, presentation, or runtime configuration.
   Application MUST NOT import infrastructure. UI MUST NOT import server I/O.
5. Browser code MUST NOT import server capabilities or secrets, including through
   intermediate imports. Validate untrusted data at runtime boundaries. Never
   serialize secrets into public configuration, component props, or HTML.
6. Pages MUST use central locale route mappings; localized URLs MUST work without
   cookies or JavaScript. Metadata MUST describe the rendered locale.
7. Keep components focused; approximately 150 lines is a review signal, not a
   reason to fragment coherent markup. Use explicit names instead of generic utils.

Verification: `pnpm run typecheck`, lint and browser tests cover framework
integration; reviewers inspect imports, data flow and new dependencies. An
executable import contract returns when a second feature or a server capability
gives it real files to check.

## Simplicity and Proportionality Standard

1. Changes MUST use the smallest code path and surface that satisfies the requirement.
2. Contributors MUST NOT add abstractions, adapters, shared utilities, or generators
   for speculative future reuse.
3. New files MAY be added when they isolate a concern or test changed behavior.

Verification: reviewer confirms new files/abstractions are required by the changed
behavior, not speculative. The `engineering-discipline` skill is the working protocol.

## Code Quality Gates

Scope: repository-wide. Procedure: `code-quality` skill.

1. Dead code MUST be removed: `pnpm run dead-code` (knip) MUST pass; a genuinely-used
   dependency knip cannot import-trace MAY be added to `knip.json` `ignoreDependencies`
   only with justification.
2. Copy-paste duplication MUST NOT be introduced: `pnpm run dupes` (jscpd, `--threshold 0` over `src` and `scripts`, tests excluded) MUST report zero clones. Shared logic MUST be
   extracted into the owning module, not a speculative utility.
3. Both gates run inside `pnpm run check` and CI, and MUST pass.

## Testing Standard

1. Unit/component tests MUST use **Vitest** for pure TypeScript behavior; rendered components use Playwright and assert
   user-visible behavior.
2. Test files live next to source as `*.spec.{ts,tsx}` / `*.test.{ts,tsx}`.
3. Browser end-to-end tests use **Playwright**, live in `e2e/**/*.spec.ts`, and run
   against a production build via `pnpm run test:e2e` — separate from `check` (they
   need a browser and a server) and covered by a dedicated CI `e2e` job. Procedure:
   `frontend-e2e` skill.

4. Tests MUST protect observable behavior and distinct failure modes rather than
   private implementation or duplicated coverage. Tool scripts use Node's test runner.
5. Dependency, global configuration, and CI changes MUST run the full local gate
   and browser suite. Documentation-only iteration MAY use formatting and skill
   validation; state which checks actually ran.

Verification (minimum merge gate): `pnpm run check` passes
(formatting, skill validation, tool tests, lint, typecheck, test, build, dead-code,
dupes); the CI `e2e` job passes. Use `change-review` for a final review of non-trivial
changes. Do not invent coverage thresholds or tests solely to raise a number.

## UI and Content Standard

Scope: `src/**`. Procedures: frontend skills and `design-review`.

1. UI colors MUST use semantic tokens in `src/styles/tokens.css`, including both
   light and dark values. Raw Tailwind palettes and bare white/black utilities
   MUST NOT appear in components.
2. User-facing text MUST use synchronized Spanish and English catalogs in `src/i18n/messages`;
   proper names, contact addresses, and technology names MAY remain literal.
3. Dates and numbers MUST use locale-aware formatters when added to UI.
4. Unsupported actions and unverified project claims MUST remain truthful;
   unavailable project links stay non-interactive.
5. Loading states MUST preserve the ready layout's container, gutters, and major
   geometry. Mutations MUST expose scoped pending and outcome feedback.
6. Visible layout or interaction changes SHOULD be inspected from rendered pixels
   at affected widths in both themes; a rendering limitation is an acceptable
   deviation only when the missing evidence is recorded.
7. Shared visual decisions MUST be recorded in `DESIGN.md`; numeric token values
   stay in CSS. Remove superseded UI after replacement behavior is covered.

Verification: browser theme checks and catalog tests, `pnpm run ai:guard`, relevant browser
journeys, and rendered inspection for visible changes.

## Commit Message Standard

Commit messages MUST follow **Conventional Commits 1.0.0**. Procedure: `commit-check`
skill.

1. Every commit MUST start with a valid type: `feat`, `fix`, `refactor`, `perf`,
   `docs`, `test`, `build`, `ci`, `chore`, `revert`.
2. Scope is optional and SHOULD map to a site area when one applies (e.g. `home`,
   `projects`, `blog`, `layout`, `ci`).
3. Breaking changes MUST use `!` and/or a `BREAKING CHANGE:` footer.
4. Subjects MUST be concise, specific, and in English.
5. Commit messages and PR descriptions MUST NOT include authorship trailers or
   AI-attribution footers (e.g. `Co-Authored-By:`, `🤖 Generated with ...`).

Examples: `feat(projects): add case-study card grid`, `fix(layout): correct dark-mode
contrast`, `chore(ci): pin node via .nvmrc`.

## Git Risk Controls

1. Prefer `git revert` to undo published commits; prefer non-destructive
   `git restore`/`git reset` for local corrections.
2. High-risk commands (`git reset --hard`, `git clean -fd`, `git push --force`) require
   explicit confirmation; if a force update is unavoidable use `--force-with-lease`,
   never plain `--force`.
3. Do not commit feature work directly on `main`; create a working branch first.
4. Before opening a PR, review the diff and run the applicable gates. Once a PR
   exists, run `pr-ready` before reporting it ready or mergeable (ancestry,
   mergeability, required checks, and all reported checks).
5. After a merge, sync local `main` from `origin/main` without discarding local work.

## CI and Supply Chain Standard

Scope: `.github/workflows/**`, `.github/dependabot.yml`.

1. GitHub Actions MUST run lint, typecheck, test, and build on pull requests (see
   `.github/workflows/ci.yml`).
2. Dependency update automation MUST be configured via `.github/dependabot.yml`.
3. Workflow credentials MUST live in GitHub Secrets and MUST NOT be committed.
4. Workflows MUST declare read-only default permissions, job timeouts, and actions
   pinned to full commit SHAs. Dependabot maintains GitHub Actions pins.
5. Superseded PR runs MAY be cancelled; pushes to `main` MUST complete independently.
6. Dependency security checks MUST fail on high or critical advisories. Use
   `pnpm run security:audit` and the dedicated workflow; audit service failures
   MUST NOT be reported as a clean audit.

## Decision Records (ADRs)

Decisions that shape the repo and are not obvious from the code — hosting, testing
strategy, a framework/tooling or theming choice — SHOULD be recorded as a short ADR
under `docs/adr/` (copy `0000-template.md`). Records state the decision, the options
weighed, and the consequences; status flows `Proposed` → `Accepted` → `Superseded by
NNNN`. Reference the relevant ADR from the PR that enacts or changes the decision.
Keep decisions proportional: compare viable alternatives, explain the current
site need, record risks and verification, and date any external sources consulted.

## Agent Skills and Local Configuration Standard

Scope: `.agents/**`, `.claude/**`, related `.gitignore` entries, `CLAUDE.md`.

1. A repeatable, verifiable procedure SHOULD be a skill rather than appended here.
2. Canonical skills MUST live under `.agents/skills/**` as `SKILL.md` files; Claude
   Code discovery MUST be a `.claude/skills` symlink to `.agents/skills` — skill files
   MUST NOT be duplicated across paths.
3. Team-owned config MUST be committed (`.agents/skills/**`, the `.claude/skills`
   symlink, `.claude/settings.json`); personal/machine config
   (`.claude/settings.local.json`) MUST stay gitignored.
4. `.claude/settings.json` and skill files MUST NOT contain plaintext secrets.
5. Every committed skill MUST be a `SKILL.md` with `name` and `description`
   frontmatter, and the `description` MUST state when the skill applies.
6. A committed skill MUST NOT silently contradict a rule here; a skill MAY supersede a
   rule only if the same change updates that rule so the two stay coherent.
7. `CLAUDE.md` MUST stay minimal, MUST defer to this file, and MUST NOT duplicate
   normative rules.

Verification: `readlink .claude/skills` resolves to `../.agents/skills` with no
duplicated `SKILL.md`; reviewer checks frontmatter and that no plaintext secrets exist.

## File and Naming Conventions

Files use kebab-case (`project-card.astro`, `format-date.ts`). Prefer explicit names;
`service.ts`/`utils.ts` are discouraged. Tests are `*.spec.{ts,tsx}` next to source.

## Available Skills

- `engineering-discipline` — evidence, scope, implementation and verification.
- `astro-development` — project-specific Astro workflow and official references.
- `frontend-architecture` — routing, shared UI, feature boundaries.
- `backend-architecture` — future runtime endpoints, ports, database integration.
- `frontend-performance` — static HTML, progressive enhancement and asset budgets.
- `frontend-design` — intentional visual design within the approved brief.
- `frontend-theming` — semantic tokens, system theme and persistent override.
- `frontend-i18n` — explicit localized URLs, synchronized catalogs and metadata.
- `frontend-e2e` — production browser journeys and accessibility.
- `code-quality` — dead code and duplication gates.
- `commit-check` — validate a change before committing.
- `pr-ready` — verify GitHub ancestry, mergeability and checks.
- `grill-me` — pressure-test a decision when requested.
- `change-review` — review concrete correctness and regression risks.
- `design-review` — inspect rendered UI against the brief.
- `local-development` — start, stop and diagnose local servers.
