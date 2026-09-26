# ADR 0014: Line icons from Lucide

- Status: Accepted
- Date: 2026-09-25

## Context

The Stack room's diagrams list what each layer takes in (screens, state, the
layers of a request, documents) in rows of 14 to 17px text, each with a small
icon. Those icons were bitmaps of seven cells, the site's pixel glyphs. At
16px a seven-cell bitmap reads as a heavy block beside light text, and a row
at work could not be told from what the diagram delivers, which is also drawn
in pixels. The owner asked for the rows to read as line drawings: a 1.5px
stroke on a 16px icon, with pixels kept for the delivered result in the
accent, the same two readings of one object the value cards already use.

## Options

1. **Keep the pixel bitmaps**: no change, and the rows keep outweighing
   their words.
2. **Draw the line icons here**: no dependency, but seventeen drawings on a
   shared grid and stroke to design and keep consistent by hand.
3. **Lucide** (ISC): one consistent 24-unit grid with round joins, each icon
   its own module, rendered to inline SVG at build time by its Astro package.

## Decision

Option 3, pinned (`@lucide/astro` 1.48.0), used only at build time. Each icon
is imported by its own path, so the build compiles only the seventeen the
diagrams use. The markup is SVG attributes only, so the CSP needs nothing new.
The stroke is set in CSS to 2.25 units of that grid, 1.5px at the rows' 16px,
and scales with the icon, so a phone that shows a diagram at half its size
shows its lines at half their weight too. Pixel glyphs
stay for everything else: arrows, buttons, the changelog, and in the diagrams
the rendered cells and the join.

## Consequences

- No script and no request. The home page's HTML grows from 45.1 to 46.1 kB
  gzip, and its CSS from 18.4 to 18.6 kB.
- A new icon is one import from the package, at the same stroke as the rest.
- The icons are used unmodified under the package's ISC licence, which ships
  with it.
