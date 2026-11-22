# ADR 0008: Motion with bundled GSAP

- Status: Accepted
- Date: 2026-09-22

## Context

The site's motion is what makes it feel like a machine rather than a page:
every headline opens character by character through a scramble, links scramble
on hover, the hero types its fragment, and two sections scrub a numbered-card
timeline against the scroll. That needs a library that splits text across
nested elements and line breaks, scrambles it, and scrubs a timeline against
the scroll. This site's CSP is `script-src 'self'` plus hashes, so nothing may
load from a CDN, and every effect must disappear under reduced motion.

## Options

- **GSAP 3.15 bundled** (chosen): SplitText, ScrollTrigger and
  ScrambleTextPlugin ship free inside the `gsap` package since 3.13 under its
  standard no-charge licence, so the reveal, the scrub and the scramble are
  plugin calls. `gsap.matchMedia` reverts every split and tween when the
  motion preference changes. All writes go through CSSOM, which the CSP
  allows. Cost, measured from the build: one module of 132.8 kB minified,
  51.0 kB gzip (core 28.3, ScrollTrigger 18.0, ScrambleText 4.0, SplitText
  3.7 kB gzip), loaded as a deferred module that never blocks rendering.
- **Motion** (Framer Motion's vanilla core): smaller for plain tweens and
  springs, but its free core has no text splitting, no scramble and no pinned scrub; each would
  be written here.
- **Hand-rolled** (IntersectionObserver, `requestAnimationFrame`, CSS
  scroll-driven animations): a few kilobytes, but it reimplements splitting
  that survives nested elements and line breaks, scramble timing, and a scrub
  that holds across resizes; CSS scroll timelines can scrub a property but
  cannot split or scramble text.

## Decision

Bundle `gsap` at an exact version and import each plugin explicitly
(`gsap/ScrollTrigger`, `gsap/SplitText`, `gsap/ScrambleTextPlugin`) from one
shared component, `src/components/motion.astro`, so the bundle carries only
what is used.

Two rules bind every effect:

- **Accessibility.** A revealed heading carries its phrase as `aria-label` and
  hides the visual copy, so per-character spans never reach assistive
  technology and a screen reader never announces fragments. A scrambling link
  pins its name before the first hover. The cursor blinks four times and
  holds, so nothing blinks for more than five seconds.
- **Reduced motion.** Everything is created inside
  `gsap.matchMedia('(prefers-reduced-motion: no-preference)')`; with reduce, the
  page is its static HTML and CSS transitions are off. A browser test asserts
  it.

## Consequences

- About 51 kB of gzip script on every page, the largest single asset. It is
  deferred and cached immutably under `/_astro/`.
- The motion values (0.04s stagger, 0.4s scramble, `top 80%`, play once) live
  in one file.
- A GSAP upgrade is a normal Dependabot bump; the motion and CSP browser tests
  exercise it.

## Sources

Checked against the installed `gsap@3.15.0` on 2026-09-22 (its `license`
field, type definitions and source, which write styles only through CSSOM):

- [GSAP standard licence](https://gsap.com/standard-license)
- [SplitText](https://gsap.com/docs/v3/Plugins/SplitText/)
- [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [gsap.matchMedia](<https://gsap.com/docs/v3/GSAP/gsap.matchMedia()>)
