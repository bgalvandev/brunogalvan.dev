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
- **Sections.** Seven numbered rooms after the hero, each built from a master
  archetype: What I do (value cards), By the numbers (stat grid and a career
  chart), Stack (capability cells in a band), Method (numbered cards drawn by
  the scroll), Code (a code window on a dotted stage), Projects (document
  cards) and Experience (a changelog timeline), then the closing room and the
  footer. Every figure, count and period is computed from `src/data` at build
  time.
- **Extension pages.** Each opens in a dark gridded band with a tag and its
  statement as the h1, then numbered rooms in the home page's grammar.
  Experience shows every role with its length computed from its period and,
  where the record names them, its clients, then education. About carries the
  four working rules in full, the stack and the languages. A case study states
  its facts (stack, repository, demo), then four rooms: context, architecture,
  decisions and one excerpt of code pinned to its commit, and leads to the next
  case. Where a role's work is verified in its repositories (ClinicSay, read
  on 2026-09-22), the page lists what was built, at feature level; the other
  roles keep one line until the updated CV supplies more.
- **Menu.** Below the tablet breakpoint the page tabs fold into a native
  disclosure, so the menu works without JavaScript.
- **Content.** The record describes current work for large companies in the
  United States: the stack is what Bruno's own 2025–2026 commits show, the
  technical-challenge projects are gone, and work at an employer appears at
  feature level with no code, internals or team-built parts. English is the
  default language (ADR 0010).
- **Words.** Measured on 2026-09-22 with `innerText` of the home page's main,
  decoration and code excluded: 535 visible words in English, 543 in Spanish.
  Section 4 of the plan set a target near 300; on 2026-09-22 the owner asked
  for more information, experience and technology instead, so the record, not
  the budget, sets the length.
- **Theme.** The system preference works without JavaScript; the toggle is a
  progressively enhanced override, hidden until its script runs.

## Beyond the master

What this site does that the master does not, and why each earns its cost:

- **Truth.** Every figure is computed from the record at build time, the code
  shown is the cited file at a pinned commit, and nothing links where nothing
  can be followed. The master fills its slots with invented customers.
- **Two designed themes.** Light and dark, with bands that stay distinct in
  both; the master has one.
- **Two languages.** Spanish and English with reciprocal `hreflang` and an
  `x-default`; the master is monolingual.
- **Accessible motion.** Split headings keep their phrase on `aria-label`,
  scrambling links pin their name, nothing runs under reduced motion, and a
  pause control stops everything that moves on its own (WCAG 2.2.2).
- **Prerendered navigation.** Speculation Rules prerender an internal page as
  the pointer settles on its link, so the click is instant where supported.
  Cost: one inline JSON block, hashed into the CSP.
- **Page transitions without JavaScript.** Cross-document view transitions
  cross-fade between pages while the header holds still; unsupported browsers
  just load the page. Cost: a few lines of CSS, off under reduced or paused
  motion.
- **A social card per page.** One card per page and language, drawn
  in the site's grammar by the existing card script (no new dependency;
  508 kB of committed PNGs). A browser test fails if a page names a card that
  does not exist.
- **Smooth scroll.** Lenis eases the wheel so the scrubbed Method room moves
  continuously (ADR 0009, 5.4 kB gzip); keyboard, touch and anchors stay
  native.
- **Printable as a CV.** Printed, the site drops its chrome and decoration,
  prints light in either theme, shows both code samples and spells out the
  address of each profile.
- **Structured data.** Each case study describes itself as
  `SoftwareSourceCode` with a `BreadcrumbList`; the Person carries languages
  and education.
- **Lit dark panels.** The code window's header carries an inset top
  highlight, the Raycast technique, from a themed token.
- **A numbered rail.** From 992px a fixed rail in the right gutter lists the
  seven rooms by number, slides out each label on hover or focus, marks the
  room crossing the middle of the viewport with the accent and
  `aria-current="location"`, and fills a hairline as the page is read. The
  links are plain anchors; the fill is a CSS scroll-driven animation, absent
  where unsupported; one observer marks the room. Below 992px the gutter is too
  narrow, and the eyebrow already numbers each room.
- **No framework runtime.** Static Astro output; the master ships jQuery and
  the Webflow runtime on every page.

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
- By the numbers charts the career itself, one bar per month as tall as the
  months into the role, with company names over each run; the master's chart
  is a picture of invented data behind a with/without toggle, and there is no
  second series here to toggle.
- Stack is the master's capability cards as a three-by-two grid with the tools
  as tags; its tabbed feature panel shows product screenshots, and there are
  none to show. The headline leads, as in every other room.
- Method is drawn by the scroll only from 992px up, where the four cards sit
  in one row. A card not reached yet dims to a colour that still passes
  contrast; the master drops it to 30% opacity and hides its text.
- Code shows three files from this site's own repository, verbatim, pinned to
  the commit they were read at: the master has three tabs, and this is the
  code the visitor can follow. The language switch is a radio group clicked by the visitor and working
  without JavaScript; the master switches its tabs with the scroll. Syntax
  colours come from classes, since Shiki's inline styles break the CSP.
- Projects pulls one project out across the first row, its text beside its
  cover, as portfolios do, and gives each card a cover generated from its
  name, chosen from captures over cards with no image. A card follows its code
  link; a project with no public code shows plain text.
- Experience marks every role with the same neutral square: an accent beside
  the current one would read as an availability signal.
- The closing room keeps the master's card and marquees; the email and the
  profiles appear once, in the footer. The footer has no newsletter form.
- Every section button leads somewhere true (this repository, every
  repository, the whole career, the email) where the master's all say contact
  us or get started.
- Code offers two languages, not three: there are two public files worth
  reading. The window's title bar names the repository and file and links to
  it at the pinned commit, where the master's names the product.
- Experience has no paragraph under its button: the headline already states
  the span, and the page is over its word budget. The timeline has four
  entries because there are four roles.
- The footer sets the name as its wordmark where the master sets a logo, lists
  profiles without brand icons (no artwork is carried over), and ends with the
  source link instead of legal pages the site does not need.
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
