# ADR 0009: Smooth scroll with Lenis

- Status: Accepted
- Date: 2026-09-22

## Context

The design master's motion is driven by the scroll: headlines open at `top
80%`, and the Method room is drawn with `scrub: 0.8`. With a stepped mouse
wheel, native scrolling jumps in 100px notches and a scrubbed timeline jumps
with it. Inertial scrolling smooths those steps into one continuous motion,
which is most of what makes a scroll-driven page feel finished. It must never
take scrolling away from anyone: keyboard, touch, anchors, the skip link and
reduced motion have to behave exactly as native.

## Options

- **Lenis 1.3** (chosen): a small library that eases wheel input and writes the
  real window scroll, so `position: sticky`, anchors and ScrollTrigger keep
  working. It can run on GSAP's ticker, so ScrollTrigger reads the position
  the page shows. Cost, measured from the build: 5.4 kB gzip (18.7 kB
  minified), inside the deferred motion module, which grows from 51.0 to
  57.4 kB gzip with this and the other changes of the same pull request.
- **GSAP ScrollSmoother**: ships in the `gsap` package, so no new dependency,
  but it wraps the page in a fixed container and transforms it, which breaks
  `position: sticky`, and the Method room and the hero band rely on sticky.
- **CSS `scroll-behavior: smooth`**: smooths only programmatic and anchor
  scrolling, not the wheel, so it does not address the problem.
- **Native scrolling only**: zero cost, and the scrubbed room steps with the
  wheel.

## Decision

Bundle `lenis` at an exact version and create it inside the same motion
context as everything else, so it exists only while motion is allowed (no
reduced-motion preference, not paused from the header) and is destroyed when
motion stops. It runs on `gsap.ticker` with lag smoothing off and calls
`ScrollTrigger.update` on every scroll. Anchors keep their native jump
(`anchors: false`), so the skip link still moves focus; touch keeps native
scrolling (`syncTouch` stays off); a wheel over a code window scrolls that
window, not the page. The two rules Lenis needs are copied into
`global.css`, since the package does not export its stylesheet.

## Consequences

- 5.4 kB gzip more script, deferred and cached.
- Mouse-wheel scrolling feels inertial in every supported browser; keyboard,
  touch and assistive technology are unchanged.
- A browser test asserts Lenis is active with motion, gone when paused and
  never created under reduced motion; the skip-link and anchor tests guard the
  native paths.

## Sources

Checked against the installed `lenis@1.3.26` on 2026-09-22: its type
definitions (`anchors`, `autoRaf`, `prevent`, `syncTouch`) and its
stylesheet.
