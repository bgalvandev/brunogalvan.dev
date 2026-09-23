# AGENTS.md

Engineering standard for the website at `brunogalvan.dev`. It applies to every
contributor, human or AI, and to CI. It holds standing rules; repeatable
procedures live in `.agents/skills/**`, design memory in `DESIGN.md`, and
structure in `docs/architecture.md`. MUST, MUST NOT, SHOULD and MAY follow
RFC 2119. Direct user instructions override this file. When a better practice
supersedes a rule, update the rule in the same change; silent drift between rule
and practice is the only thing forbidden without exception.

## Identity and content

1. `src/config/site.ts` is the only source of the public name, origin, contact
   email and profile links; tests and scripts import it rather than repeating it.
2. Contributors MUST NOT invent clients, metrics, testimonials, affiliations or
   project claims; unavailable links stay non-interactive.
3. Technical artifacts are written in English; site copy is Spanish and English.
4. An artifact MUST explain decisions in brunogalvan.dev terms and MUST NOT
   attribute work or design to an external person, course, product,
   repository, or reference source; it MAY name an adopted dependency,
   standard, license, or security advisory when that identity is needed to
   operate or verify the decision. Artifacts are ADRs, `DESIGN.md`, technical
   docs, code comments, commit messages and pull request titles and
   descriptions.

## Stack and structure

5. Astro 7 with static output, TypeScript on Astro's `strictest` preset, Tailwind
   CSS v4, Node from `.nvmrc`, pnpm from `package.json`, `--frozen-lockfile` in
   CI. The lockfile is never edited by hand.
6. `src/pages` composes routes, `src/layouts` owns the document, `src/components`
   is shared UI, `src/data` is the verified record (roles, projects, stack) with
   every figure derived from it, and `src/modules/<feature>` holds a feature's own
   files. Shared code MUST NOT import a feature. Directories exist only when they
   hold files.
7. Changes MUST use the smallest code path that satisfies the requirement. No
   abstractions, adapters or utilities for hypothetical reuse; kebab-case file
   names; no `utils.ts` or `service.ts`.
8. Localized URLs live as pairs in `src/i18n/routes.ts`; all visible text lives
   in both catalogs under `src/i18n/messages`; metadata describes the rendered
   locale; every URL works without cookies or JavaScript.
9. Colors and font families come from the semantic tokens in
   `src/styles/tokens.css`, each with a light and a dark value. Raw Tailwind
   palettes, bare white or black utilities and literal font stacks MUST NOT appear
   outside that file.

## Verification

10. `pnpm run check` MUST pass before merge: formatting, token check, tool tests,
    lint, typecheck, unit tests, build, dist check, dead code and duplication. The CI `e2e`
    job MUST pass. A failing gate is fixed at its cause, never weakened, deleted or
    ignored.
11. Vitest tests pure TypeScript, Playwright tests the production build in a real
    browser with axe in both themes, and Node's test runner covers repository
    scripts. Tests protect observable behavior and distinct failure modes; there
    are no coverage thresholds.
12. A change a visitor could notice MUST be confirmed in the production build in
    a real browser before the pull request is reported ready: layout and
    interaction changes from rendered captures at narrow, tablet and desktop
    widths in both themes, behavior changes by walking the flow, and the pull
    request names the capture paths and what was not exercised. When a state
    cannot be rendered, the missing evidence is stated.

## Git and CI

13. Commits follow Conventional Commits 1.0.0 with types `feat`, `fix`,
    `refactor`, `perf`, `docs`, `test`, `build`, `ci`, `chore`, `revert`; no
    authorship or AI-attribution trailers. Feature work never starts on `main`.
14. Published history is undone with `git revert`; a forced update, only when
    unavoidable, uses `--force-with-lease`. Before reporting a pull request ready,
    run the `pr-ready` skill.
15. Workflows declare read-only permissions, job timeouts and actions pinned to a
    full commit SHA; credentials live only in GitHub Secrets. Dependabot keeps
    dependencies and actions current. Dependency security checks fail on high or
    critical advisories, and an audit service failure is never reported as clean.

## Decisions and skills

16. A decision not obvious from the code (hosting, framework, testing strategy) is
    recorded in `docs/adr/NNNN-title.md` with context, options and consequences.
17. Skills are canonical under `.agents/skills/**`, discovered by Claude Code
    through the `.claude/skills` symlink, and declare `name` and a `description`
    stating when they apply. A skill MUST NOT contradict this file; `CLAUDE.md`
    stays minimal and defers here.
