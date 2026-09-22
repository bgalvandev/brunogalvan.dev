# Design memory

## Current brief

A bilingual portfolio for Bruno Galván, built in the grammar of one design
master, <https://aeye-saas.webflow.io/>: sharp rectangles, 1px hairlines,
numbering through everything, mono for every label and a grotesque for every
statement, one accent used boldly in small areas. Every shape, component and
animation comes from the master; no content does. The master sells a product
and has customers; this site says only what the public record supports, so a
slot with no truthful content is deleted rather than filled.

The visitor should know within five seconds whose site this is and what Bruno
builds, read one idea per section, and reach the email, GitHub or LinkedIn from
anywhere. Depth lives on extension pages, never on the home page.

## Shared decisions

- **Faces.** Geist carries statements, Geist Mono carries every label and
  control, Geist Pixel Square carries only the hero's bracketed fragment and the
  decorative heading slashes. Three latin files ship through Astro's font
  pipeline, preloaded: Geist 29.4 kB, Geist Mono 23.1 kB, Geist Pixel Square
  28.5 kB (81.1 kB in all). Rejected: Archivo and JetBrains Mono, the previous
  pair, which read as a different site from the master.
- **Type.** Display 72px and section headline 56px at weight 400, never bold;
  negative tracking on everything (−0.06em display, −0.05em body, −0.04em mono);
  body leading 1.3, so blocks read as specification text. Sizes step down at the
  master's own breakpoints (992, 768, 480px). The scale lives in `@theme` in
  `src/styles/global.css`.
- **Shape.** `border-radius` is zero everywhere; Tailwind's radius scale is
  removed and a browser test fails on any rounded box. Every border is 1px solid
  and adjacent cells share edges.
- **Colour.** Greys are the master's, except that tertiary text moves from
  `#7a7a7a` (4.29:1 on white, failing AA) to `#6b6b6b`, and the master's paler
  total in the eyebrow is replaced by value: the current number carries ink.
  Every text pair passes 4.5:1 in both themes. Decoration that must stay faint
  (heading slashes) is generated content with an empty text alternative, so it
  is neither text nor read aloud.
- **Accent.** Vermilion, `#c8341a` light / `#ff7a5c` dark, chosen from captures
  on 2026-09-22 over the previous indigo and a signal green; the master's
  `#0055ff` was excluded so the page never reads as a copy. The accent marks the
  current page, the hero fragment, hover fills and, later, the pixel field.
  Other selected states (current language, pressed theme) invert to ink.
- **Bands.** A band is a full-bleed room in the dark scheme: it sets
  `color-scheme: dark`, so every `light-dark()` token inside re-resolves with no
  colour written twice. Its paper is a registered `--band-paper`, resolved once
  on the root: `#212121` on a light page, a deeper `#141414` on a dark one.
  Chosen from captures on 2026-09-22 over inverting the band to the light scheme
  in dark mode, which glared.
- **Layout.** Sections own the full width and hold content in `.measure`: the
  master's 8% gutter (5% tablet, 1.5rem phone) capped at 80rem, set as an
  explicit width so it behaves the same in block, flex and grid parents. Nothing
  measures the viewport, so a scrollbar never causes overflow. Space follows the
  master's 8px system, 8 to 80px; only control padding goes below it.
- **Components.** The eyebrow `[N.01/07] —— > LABEL ———` is read off the
  section list, so the count cannot disagree with the page, and speaks as
  "Section 1 of 7: label". The headline is two short sentences between slashes.
  The solid button is an ink rectangle with a square bullet; on hover the
  accent slides in behind, the label steps left and an arrow appears. The line
  button grows a 4px accent underline. Navigation is boxed tabs hanging from the
  top edge, the current page filled with the accent inside `<` `>`.
- **Icons.** Drawn as bitmaps on a pixel grid (`pixel-icon.astro`), the same
  language as the pixel face, with no artwork carried over. Card icons render at
  7.5rem so a one-cell stroke weighs what the master's line drawings weigh.
- **Motion.** The master's, value for value: every headline opens character
  by character, 0.04s apart, each character widening over 0.1s while it
  scrambles for 0.4s, triggered once at `top 80%`; links and buttons scramble
  their label for 0.8s on pointer hover; the hero types its fragment once.
  Every hover transition is 0.2s. Beyond the master: a revealed heading keeps
  its phrase on `aria-label` and hides the characters, a scrambling link pins
  its name first, the cursor stops blinking within five seconds, and all of it
  is off under reduced motion. The library decision is ADR 0008.
- **Texture.** The pixel field is the master's grid, thirty square cells to a
  row (fixed at 80rem/30 below the tablet breakpoint, where it overflows on
  purpose); the pointer lights the cells it crosses in the accent and each
  fades over a second. Lines are CSS; the glow is one canvas, drawn only while
  a cell glows, where the master animates 1,350 elements. The preloader covers
  the first view of a session in accent and clears in tenth-of-the-width
  squares, in random order, over about 1.2s; a CSS failsafe lifts it at 2.5s if
  the script never arrives. The dotted field is a dot every 14px on the field
  tone; corner ticks are a pair of 4px squares at each corner. Marquees are
  bands of bordered cells that fade out at the edges, about 60px per second.
- **Pause.** A header toggle pauses everything that moves on its own
  (marquees, preloader, reveals, scrambles, the pixel trail) and persists like
  the theme, so no motion runs past five seconds without a way to stop it. It
  is hidden without JavaScript and under reduced motion, where nothing moves.
- **Theme.** The system preference works without JavaScript; the toggle is a
  progressively enhanced override, hidden until its script runs.

## Deliberate differences from the master

Each difference found in side-by-side captures at 1440px, and why it stays:

- `What I do` has four cards, not three: the content has four capabilities.
  Cards stand 28rem rather than 31rem so four narrower cards do not read as
  columns.
- Card descriptions are always visible; the master hides them until hover,
  which leaves touch and keyboard users without them.
- Card icons are pixel bitmaps rather than isometric line drawings that swap to
  pixel versions on hover; no artwork may be invented or carried over.
- The eyebrow's current number is ink and its total faint, where the master
  greys the total below readable contrast.
- The hero has no rating row, avatars or partner logos: none is true here.
- The hero fragment is typed once and the cursor holds after four blinks; the
  master retypes three words forever, which WCAG 2.2.2 forbids without a pause
  control.
- The preloader runs on the first view of a session only; the master covers
  every load, which would tax each move between pages.
- The toolchain band is a marquee at every width, with names in mono where the
  master shows six static partner logos on desktop: there are thirty-seven
  tools and no logos to show.
- The positioning line quotes the Method's rules rather than a product slogan.
- A pause control exists; the master has none.
- Hovering a `What I do` card changes nothing: the cards are not links, and
  a hover response would make them look actionable.

## Working on visible changes

Choose the depth before touching markup. A precision fix preserves the
composition and needs no exploration. A pattern extension compares plausible
compositions for new content against the existing page and implements the
smallest coherent one. A new direction is chosen from captures of the options,
never in words. For a section built from a master archetype, capture the
master's section and this site's at the same width, list every difference, and
fix it or record it above. In every case: keep spacing inside a group smaller
than spacing between groups; emphasize with weight and hierarchy before adding
sizes; never encode state with hue alone; gate all motion on reduced motion;
keep every non-linked element from looking actionable. Record a shared decision
here as objective, decision, rejected alternative and verification; numeric
values stay in CSS.

## Review protocol

Inspect production rendering at 360, 768 and 1440px in both themes and
languages. Check hierarchy, text wrapping, contact affordances, keyboard focus
and contrast, and compare against the master's equivalent section. Browser
tests save review captures under ignored `test-results`; use actual captures as
evidence, and state the missing evidence when rendering was not possible rather
than inferring quality from source. Zero verified findings is a valid result;
cosmetic preference does not justify an endless redesign.
