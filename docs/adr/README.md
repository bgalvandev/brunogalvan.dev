# Architecture Decision Records

Short, dated records of decisions that shape this repo — the _why_ behind a choice,
kept next to the code so it outlives memory and PR threads.

Write one when a decision is not obvious from the code and would cost someone time to
reverse-engineer: hosting, testing strategy, a framework or tooling choice, a data or
theming approach. Skip trivia.

- Copy `0000-template.md` to `NNNN-short-title.md` (next number, kebab-case title).
- Status flows `Proposed` → `Accepted` → `Superseded by NNNN`; link superseded records both ways.
- Keep it short. Record the _decision_ and its _consequences_, not a tutorial.

## Index

- [0005 — Astro website foundation and explicit localized URLs](0005-astro-foundation.md)

Records 0001–0004 described the replaced implementation. Their contents remain
in Git history or source backups; this directory contains current decisions.
Numbering is preserved so existing references to decision 0005 remain stable.

- [0006 — Language URLs and direct default entry](0006-language-entry.md)
