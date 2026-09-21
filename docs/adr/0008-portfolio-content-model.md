# ADR 0008: Portfolio content split between typed data and locale catalogs

- Status: Accepted
- Date: 2026-09-20

## Context

The home page carries a professional record: five positions, six projects and a
grouped technology inventory, each rendered in Spanish and English. That content
has two different natures. Periods, employers, repository URLs, demo URLs and
technology names are the same in both languages and must stay machine-checkable;
roles, context lines, highlights and summaries are prose that must exist twice.

## Decision

Split the two. Structured, locale-independent fields live in a typed module
beside the feature that renders them (`src/modules/home/experience.ts`,
`src/modules/home/stack.ts`, `src/modules/projects/projects.ts`); every prose
string lives in both catalogs under `src/i18n/messages`, keyed by the same id the
data module declares. The id type is derived from the Spanish catalog
(`keyof Messages['experience']['items']`), so a position without a translation,
or a renamed key, fails `astro check` rather than rendering an empty block.

Two consequences follow from data being typed rather than copied. A repository or
demo field is `string | null`, and `null` renders as plain text, which is how
AGENTS.md rule 2 is enforced for VitalPro's private repository and for the Star
Wars API endpoint that no longer answers. The headline experience figure is
derived from the earliest period in the timeline instead of being written into
the catalogs, so it cannot contradict the positions below it or go stale.

An Astro content collection was the alternative, and it is the right answer once
a project has a body: per-entry Markdown, a Zod schema and generated routes. It
was rejected here because no entry has a body yet; a collection would add a
schema, a loader and a second place to look for one line of prose per project,
and its i18n story still ends in one entry per language. Putting the whole record
in the catalogs was also rejected: it would translate `PostgreSQL` and
`2024-12`, and no type would connect a period to its highlights. This decision is
revisited the moment a project earns a written case study with a body.

## Verification

`astro check` proves every id resolves in both catalogs; the parity test in
`src/i18n/routing.spec.ts` proves neither catalog carries an extra or empty key;
`src/modules/home/experience.spec.ts` covers the derived year count and the
period formatting in both locales. In the browser suite, `e2e/content.spec.ts`
asserts the section order, the profile destinations, that the build resolved the
year token, and that a project without a reachable destination renders no link.
