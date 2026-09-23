# Design memory

## Current brief

A bilingual portfolio for Bruno Galván on one strict visual system: sharp
rectangles, 1px hairlines, numbering through everything, mono for every label
and a grotesque for every statement, one accent used boldly in small areas. The
site says only what the public record supports, so a slot with no truthful
content is deleted rather than filled.

The visitor should know within five seconds whose site this is and what Bruno
builds, read one idea per section, and reach the email, GitHub or LinkedIn from
anywhere. Depth lives on extension pages, never on the home page.

## Shared decisions

- **Faces.** Geist carries statements, Geist Mono carries every label and
  control, Geist Pixel Square carries only the hero's bracketed fragment and the
  decorative heading slashes. They ship through Astro's font pipeline,
  preloaded: Vercel's static, hinted Geist and Geist Mono at 400, 500 and 600,
  and Geist Pixel Square (320.2 kB in all). The variable subsets they replace
  (81.1 kB) have no hinting, so Windows drew them lighter and softer than
  designed (ADR 0013). Rejected: Archivo and JetBrains Mono, the previous pair,
  which did not hold the system's tight, technical voice.
- **Type.** Display 72px and section headline 56px at weight 400, never bold;
  negative tracking on everything (−0.06em display, −0.05em body, −0.04em mono);
  revealed text never kerns, so a letter stands where it stood while split; body
  leading 1.3, so blocks read as specification text. Sizes step down at 992 and
  768px; a phone keeps a 3.25rem display and a 2.75rem headline and lets the
  lines wrap. The scale lives in `@theme` in `src/styles/global.css`.
- **Shape.** `border-radius` is zero everywhere; Tailwind's radius scale is
  removed and a browser test fails on any rounded box. Every border is 1px solid
  and adjacent cells share edges.
- **Colour.** Greys run from ink to hairline with tertiary text at `#6b6b6b`
  (and `#a3a3a3` on dark), so every text pair passes 4.5:1 in both themes. The
  eyebrow shows its current number in ink and its total in the tertiary grey,
  value rather than a paler tint. Decoration that must stay faint (heading
  slashes) is generated content with an empty text alternative, so it is
  neither text nor read aloud.
- **Accent.** Vermilion, `#c8341a` light / `#ff7a5c` dark, chosen from captures
  on 2026-09-22 over the previous indigo and a signal green. The accent marks
  the current page, the hero fragment, hover fills and the pixel field. Other
  selected states (current language, pressed theme) invert to ink.
- **Bands.** A band is a full-bleed room in the dark scheme: it sets
  `color-scheme: dark`, so every `light-dark()` token inside re-resolves with no
  colour written twice. Its paper is a registered `--band-paper`, resolved once
  on the root: `#212121` on a light page, a deeper `#141414` on a dark one.
  Chosen from captures on 2026-09-22 over inverting the band to the light scheme
  in dark mode, which glared. A gridded band (the hero's, the closing room's, a
  page's opening) sits deeper, on `--band-deep`: `#1a1a1a` on a light page, the
  band's `#141414` on a dark one, with its grid in `#474747`.
- **Layout.** Sections own the full width and hold content in `.measure`: an 8%
  gutter (5% tablet, 1.5rem phone) capped at 80rem, set as an explicit width so
  it behaves the same in block, flex and grid parents. Nothing measures the
  viewport, so a scrollbar never causes overflow. Space follows an 8px system,
  8 to 80px; only control padding goes below it. A room's padding and the gaps
  around its heading are named steps (tiny, small, medium, large, hugh),
  `--space-*` in `global.css`, which shrink at 992, 768 and 480px, so a phone
  gets tighter rooms.
- **Components.** The eyebrow `[N.01/07] —— > LABEL ———` is read off the
  section list, so the count cannot disagree with the page, and speaks as
  "Section 1 of 7: label". The headline is two short sentences between slashes,
  each balanced on its own lines so neither ends on a word by itself. The block
  cursor of a typed fragment holds to its last letter, so on a phone the cursor
  and the closing bracket never take a line of their own. Behind the hero's
  typed word the whole word stands unseen in the same cell, so the line takes
  that word's height before its first letter and nothing below moves while it
  types. Buttons hover over 0.3s from a slow start (GSAP's power1.in,
  `--ease-power1-in`): the solid button is an ink rectangle whose accent slides
  in behind while its square turns half a turn, its label steps left and an
  arrow appears; the line button closes a 1px accent frame, grows a 4px accent
  underline and draws its icon and label in from the edges. Navigation is boxed
  tabs hanging from the top edge, the current page filled with the accent inside
  `<` `>`; the contact tab takes the accent on hover. Below the desktop
  breakpoint the bar holds the name with its chip on the left and three lines on
  the right that cross into an X; the menu opens under the bar over the page
  dimmed by half, with the pages in a mono column, the contact button, then the
  language, theme and pause (chosen on 2026-09-23 over keeping them in the bar,
  where the name broke onto two lines at 340px). The name is the wordmark: in
  the hero band beside a chip with the location (in the header bar instead below
  the desktop breakpoint) and, stacked, filling the footer's first column. A
  personal site is signed by its name; the pixel B with its accent block stays
  the favicon (decided on 2026-09-22 over a mark beside the name, which only
  repeated it).
- **Icons.** Card icons are isometric scenes of simple solids (boxes,
  cylinders, upright profiles) built in `isometric.ts` and drawn twice by
  `iso-icon.astro`: a line drawing and two-tone pixel art (faces turned left
  solid, the others a grid of cells), two readings of one object. Small glyphs
  (arrows, row icons, the changelog's `<>` and double check) are bitmaps on a
  pixel grid (`pixel-icon.astro`). Technology logos are their own published
  marks, from Simple Icons (CC0), in one grey (the owner's choice on
  2026-09-22), with LinkedIn's "in" drawn here.
- **Motion.** Every headline opens character by character, 0.04s apart, each
  character widening over 0.1s while it scrambles for 0.4s, triggered once at
  `top 80%`; links, buttons and footer links scramble their label for 0.8s on
  pointer hover. The hero's and the closing room's bracketed words cycle from
  load: each word types at 50ms a letter under a block that covers the newest
  one, holds 0.8s, the block blinks off and on twice at 0.4s, the word clears at
  once and the next follows 0.2s later. A value card, on a desktop pointer, swaps
  its line drawing for pixels over 0.1s while its title takes the accent and its
  description opens over 0.3s. Method and Code are driven by the scroll from
  992px up (Method over 200vh, Code over 250vh, both sticky at 10vh, scrub 0.8):
  Method activates a card at each quarter and swaps its drawing to pixels; Code
  checks each file at each third while its rail's line grows. The Stack's chosen
  layer opens over 0.4s, and its diagram plays a two-second loop: the hub's
  joins, brackets and channel draw out and the rows light one by one; the layers
  of a request come up one at a time, each crossed in turn; the card at work
  widens while the documents rise, arrive and fill their bar. Below 768px the
  value cards and the method become sliders (chosen on 2026-09-23 over keeping
  them stacked, which made the phone page long): the value cards one at a time,
  the next every 3.5s with a half-second cross-fade, a swipe or a dash choosing
  one; the method one card at a time, its line filling over 5s before the next
  takes its place, round and round from when its box comes into view. Every card
  stays in the page, so a screen reader reads all of them, and both stack again
  without motion. A revealed heading keeps its phrase on `aria-label` and hides
  the characters, a scrambling link pins its name first, and all of it is off
  under reduced motion. The library decision is ADR 0008.
- **Texture.** The pixel field is thirty square cells to a row (fixed at
  80rem/30 below the tablet breakpoint, where it overflows on purpose), the
  columns centred across the room and the rows down it (18 in the hero, 27 in
  the closing room, 14 in a page's opening, so a line or, with an odd count, a
  row crosses the middle), each line the right or bottom edge of its cell, so a
  row stands a line taller than a cell is wide. A cell the pointer crosses rises
  to the accent over 0.2s, stays lit 0.5s after the pointer leaves it and fades
  over 0.2s, and the cell under a resting pointer stays lit. Below 992px, where
  there is no pointer to follow, the field flickers on its own: each cell rises
  to a fifth of the accent over a second and goes dark at once, the cells
  starting in a random order spread over three seconds and the whole field again
  every four, so about a third of it glows at any moment and never all of it.
  Lines are CSS; the glow is one canvas under them, so a lit cell keeps its
  edges, drawn only while a cell glows or the flickering field is in view. The
  preloader covers the first view of a session in accent and clears in
  tenth-of-the-width squares that hold and then snap off (0.3s, expo.in, 0.01s
  apart in random order); a CSS failsafe lifts it at 2.5s if the script never
  arrives, and it runs once a session so moving between pages costs nothing. The
  dotted field is a faint diamond, 3.7px across every 13px, one translucent grey
  for both schemes; a component scales the tile to change the pitch (7.9px on
  the Method strips, 12.6px on project covers, 14.2px on the code stage, 16px
  on the Stack pane). Corner ticks are a pair of 4px squares at each corner. The
  logo row is a carousel of every tool with a published mark (the owner's choice
  on 2026-09-22, from captures), in cells of 201.6px by 132px, a grey mark and
  name, a closed box with no fade, about 60px a second; below 992px the row and
  the positioning run edge to edge, each cell three tenths of the row (half on a
  phone) by 112px. The closing room's words move at 100px a second, above and
  below in opposite directions, and the Stack's logo chips in two rows moving
  opposite ways.
- **Pause.** A header toggle pauses everything that moves on its own
  (marquees, word cycles, diagrams, preloader, reveals, scrambles, the pixel
  trail and flicker, the phone sliders) and persists like the theme, so no
  motion runs past five seconds without a way to stop it (WCAG 2.2.2). It is
  hidden without JavaScript and under reduced motion, where nothing moves.
- **Sections.** Seven numbered rooms after the hero: What I do (value cards),
  By the numbers (stat grid and a career chart), Stack (three layers as tabs, a
  diagram per layer on a dotted pane, and three cards below), Method (numbered
  cards drawn by the scroll), Code (code on a dotted stage and a rail of files),
  Projects (document cards) and Experience (a timeline), then the closing room
  and the footer. Every figure, count and period is computed from `src/data` at
  build time.
- **Extension pages.** Each opens in a dark gridded band with a tag and its
  statement as the h1, then numbered rooms in the home page's grammar.
  Experience shows every role with its length computed from its period and,
  where the record names them, its clients, then education. About carries the
  four working rules in full, the stack and the languages. A case study states
  its facts (stack, repository, demo), then four rooms: context, architecture,
  decisions and one excerpt of code pinned to its commit, and leads to the next
  case. Where a role's work is verified in its repositories (ClinicSay, read on
  2026-09-22), the page lists what was built, at feature level; the other roles
  keep one line until the updated CV supplies more.
- **Menu.** Below the desktop breakpoint the header folds into a menu, a native
  disclosure, so it opens and its links work without JavaScript.
- **Content.** The record describes current work for large companies in the
  United States: the stack is what Bruno's own 2025–2026 commits show, the
  technical-challenge projects are gone, and work at an employer appears at
  feature level with no code, internals or team-built parts. English is the
  default language (ADR 0010).
- **Words.** Measured on 2026-09-22 with `innerText` of the home page's main,
  decoration and code excluded: 570 visible words in English, 582 in Spanish.
  The first brief set a target near 300; on 2026-09-22 the owner asked for more
  information, experience and technology instead, so the record, not the
  budget, sets the length.
- **Theme.** The system preference works without JavaScript; the toggle is a
  progressively enhanced override, hidden until its script runs.

## What the site does beyond its layout

What each earns for its cost:

- **Truth.** Every figure is computed from the record at build time, the code
  shown is the cited file at a pinned commit, and nothing links where nothing
  can be followed.
- **Two designed themes.** Light and dark, with bands that stay distinct in
  both.
- **Two languages.** Spanish and English with reciprocal `hreflang` and an
  `x-default`.
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
- **A social card per page.** One card per page and language, drawn in the
  site's grammar by the existing card script (no new dependency; 508 kB of
  committed PNGs). A browser test fails if a page names a card that does not
  exist.
- **Smooth scroll.** Lenis eases the wheel so the scrubbed Method room moves
  continuously (ADR 0009, 5.4 kB gzip); keyboard, touch and anchors stay native.
- **Printable as a CV.** Printed, the site drops its chrome and decoration,
  prints light in either theme, shows both code samples and spells out the
  address of each profile.
- **Structured data.** Each case study describes itself as
  `SoftwareSourceCode` with a `BreadcrumbList`; the Person carries languages
  and education.
- **Lit dark panels.** The code window's header carries an inset top highlight
  from a themed token, so a dark surface reads as lit rather than flat.
- **A numbered rail.** From 992px a fixed rail in the right gutter lists the
  seven rooms by number, slides out each label on hover or focus, marks the
  room crossing the middle of the viewport with the accent and
  `aria-current="location"`, and fills a hairline as the page is read. The
  links are plain anchors; the fill is a CSS scroll-driven animation, absent
  where unsupported; one observer marks the room. Below 992px the gutter is too
  narrow, and the eyebrow already numbers each room.
- **No framework runtime.** Static Astro output with one bundled motion script.

## Decisions and their reasons

- `What I do` has four cards because the content has four capabilities, each
  31rem tall with its drawing in a 160px box.
- The positioning line keeps its brackets 0.5em from the words, so its line
  holds to one row at 1440px. It quotes the Method's rules and draws its arrow
  and its two shadowed squares rather than taking them from a system font, so
  every platform shows the same glyphs; each square fills the capital height, a
  hairline square of 0.6em with a shadow 0.1em deep.
- The Stack's chosen-layer tags carry dark text on the accent, since white
  fails contrast on the dark scheme's lighter accent.
- A value card's description also opens for a keyboard visitor (whenever
  focus is visible anywhere on the page), since a hover alone would leave them
  without it.
- The hero band's chip carries the location, its text light enough to pass
  contrast.
- The phone menu's three lines are square, as every box here is.
- The value slider's dashes are 24px buttons around a 16px dash, so a finger
  can hit one and a keyboard can reach it.
- A case study's title, one word (a project's name), shrinks on a phone to 11%
  of the room's width so the word never runs past it.
- By the numbers charts the career itself, one bar per month as tall as the
  months into the role, with company names over each run.
- The Stack's layers are a radio group that works without JavaScript; a layer
  not chosen dims to a colour that still passes contrast. Its diagrams are drawn
  in HTML from the record (screens and state, the layers of a request, documents
  translated), sized for a 603px pane and looping in two seconds: a hub of two
  boxes of 151 by 249 with a bracket behind each, a core of 94px and a channel
  of 10px down to a box of square cells; rows of 312 by 68, 18px apart; a card
  at work of 388 by 258 with a card of documents of 253 by 125 over its corner.
  Every text in them keeps a grey that passes contrast in every frame: a row
  waits in `--faint` and lights to ink, and a layer arrives whole rather than
  fading in. The state box's longest name sets its rows at 14px so the box keeps
  its proportions.
- Method is drawn by the scroll only from 992px up, where the four cards sit
  in one row; from 768 to 992px they stand two by two, and below 768px they
  are a one-card slider. A card not reached yet hides its description and dims
  its number and title to a colour that still passes contrast.
- Code shows three files from this site's own repository, verbatim, pinned to
  the commit they were read at, with a title bar that names and links the file.
  Its files are a radio group that works without JavaScript; on a desktop with
  motion the scroll checks them, and a file chosen by hand scrolls the room to
  its own stretch. Syntax colours come from classes, since Shiki's inline styles
  break the CSP.
- Projects pulls one project out across the first row, its text beside its
  cover, and gives each card a cover generated from its name, chosen from
  captures over cards with no image. Only a card that leads somewhere hovers
  (outline, 4px bar, rising cover): a project with no public code shows plain
  text and must not look actionable.
- Experience frames `<>` beside the current role and a double check beside
  each past one, in neutral ink: an accent beside the current one would read as
  an availability signal. It has no paragraph under its button, since the
  headline already states the span, and four entries because there are four
  roles.
- The closing room holds one card between two word bands; the email and the
  profiles appear once, in the footer. The footer has no newsletter form and
  ends with the source link instead of legal pages the site does not need.
- Every section button leads somewhere true: this repository, every
  repository, the whole career, the email.

## Working on visible changes

Choose the depth before touching markup. A precision fix preserves the
composition and needs no exploration. A pattern extension compares plausible
compositions for new content against the existing page and implements the
smallest coherent one. A new direction is chosen from captures of the options,
never in words. For a section's composition, capture it at the same widths
before and after, list every difference, and keep it or record the decision
above. In every case: keep spacing inside a group smaller than spacing between
groups; emphasize with weight and hierarchy before adding sizes; never encode
state with hue alone; gate all motion on reduced motion; keep every non-linked
element from looking actionable. Record a shared decision here as objective,
decision, rejected alternative and verification; numeric values stay in CSS.
Every note here explains a decision in this site's terms and credits no
outside source (AGENTS.md rule 4).

## Review protocol

Inspect production rendering at 360, 768 and 1440px in both themes and
languages. Check hierarchy, text wrapping, contact affordances, keyboard focus
and contrast. Browser tests save review captures under ignored `test-results`;
use actual captures as evidence, and state the missing evidence when rendering
was not possible rather than inferring quality from source. Zero verified
findings is a valid result; cosmetic preference does not justify an endless
redesign.
