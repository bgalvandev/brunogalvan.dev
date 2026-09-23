# ADR 0011: Technology marks from Simple Icons

- Status: Accepted
- Date: 2026-09-22

## Context

The owner asked for the technologies to appear with their own marks, as the
design master shows partner logos, and chose from captures on 2026-09-22 a
band of every tool with a mark, in brand colour, moving. The same marks fill
the Stack room's two rows of chips. The site ships no images of third-party
artwork and loads nothing from a CDN.

## Options

1. **Names only**, as before: no weight, but the owner's request is unmet.
2. **Devicon** (MIT): coloured, multi-path SVG files, several per tool; a
   larger package and heavier markup, and colour baked into the art.
3. **Hand-drawn marks**: no dependency, but a drawn copy of a trademark is
   worse than the real one.
4. **Simple Icons** (CC0): one path per mark and its brand colour as data,
   imported by name at build time.

## Decision

Option 4, pinned (`simple-icons` 16.32.0), used only at build time. Each mark
is a `<symbol>` in one sprite per page (`tech-sprite.astro`), and every logo
is a `<use>` of it, filled with the brand colour as a presentation attribute,
which the CSP allows where a style attribute would not; a brand colour too
dark or too light to read on both papers falls back to the text colour. Marks
Simple Icons does not carry are left out (OpenAI, Playwright: name only) or,
for LinkedIn's "in" in the footer, drawn here.

## Consequences

- No script and no request: the home page's HTML grows from 15.0 to 44.4 kB
  gzip, the sprite of 29 marks accounting for about 20 kB of it and the looped
  copies for little, since each is a `<use>`.
- A page that shows a logo must render the sprite; a browser test fails on any
  `<use>` that points at nothing.
- Trademarks stay their owners'; they identify the tools used, nothing more.
