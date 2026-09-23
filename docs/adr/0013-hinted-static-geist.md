# ADR 0013: Hinted static Geist

- Status: Accepted
- Date: 2026-09-23

## Context

On his Windows screen the owner saw the site's Geist look like a different
font, although its computed family, weight, size and tracking were right.
Every set of Geist files carries the same design. The site's text went wrong
in two ways:

- **Hinting.** Vercel's static files, one per weight (Geist and Geist Mono at
  400, 500 and 600), carry TrueType hinting (`fpgm`, `prep`, `cvt`). The site
  shipped fontsource's variable latin subsets, which carry none. Neither do
  fontsource's static files or Vercel's own variable files. Windows snaps
  hinted outlines to the pixel grid and renders unhinted ones lighter and
  softer, so on Windows only hinted files render as designed. On Linux and
  macOS the two render alike, so no capture made here could show the
  difference.
- **Kerning.** The reveal splits a heading into one box per letter, and split
  letters never kern. The site kerned them once the reveal ended, and the text
  narrowed by 1 to 3% as it did (the hero's first line, 468.4px to 462.3px at
  1440).

## Options

1. **Keep fontsource's variable subsets** (81.1 kB for three faces): the
   lightest, and the look the owner rejected.
2. **Subset Vercel's static files ourselves**: hinted and small, but a
   subsetting tool in the build, or generated binaries in the repository that
   Dependabot cannot update.
3. **Vercel's static, hinted files, one per weight the site sets** (chosen):
   from the `geist` package the site already installs for Geist Pixel Square.

## Decision

Option 3. Astro's font pipeline declares Geist and Geist Mono at 400, 500 and
600 from `node_modules/geist/dist/fonts`, beside Geist Pixel Square. The
fontsource packages are removed. The social-card script, which draws in
Chromium on Linux, where hinting changes nothing, takes one variable file per
family from the same package. Text the reveal splits sets `font-kerning: none`,
since split letters never kern, so reverting the split moves nothing.

## Consequences

- Seven font files ship and are preloaded: Geist 138.2 kB, Geist Mono
  153.5 kB, Geist Pixel Square 28.5 kB, 320.2 kB in all against 81.1 kB. The
  home page's first screen at 1440 sets all seven faces. They are served
  immutable, so the cost falls on the first visit only.
- The files carry the full character sets, not only latin.
- `scripts/check-dist.mjs` expects the seven files and a preload for each.
- Revealed headings are 1 to 3% wider than kerned text. Each sentence of a
  headline balances on its own, so the wider lines never leave a word alone on
  the last line.
- Only a Windows browser shows the hinting. The captures made here come from
  Chromium on Linux, and prove only that the served files are the hinted ones.
