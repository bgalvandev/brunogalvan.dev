---
name: frontend-performance
description: Measure and improve Astro page delivery, client scripts, fonts, images, or expensive interactions. Use for performance work and new client-side capabilities.
---

# Frontend Performance

Render public content as static HTML by default. Locale selection uses real links;
content must remain readable with JavaScript disabled. The current browser code
only restores and changes the theme.

1. Inspect the production build and browser network before optimizing. Record the
   route, viewport, cache/network conditions and measured result.
2. Keep browser scripts scoped to interactions. Do not add a UI framework for a
   simple control. For a justified island, choose hydration timing deliberately.
3. Self-host fonts. Add only used weights/subsets, preload only measured critical
   assets, and retain fallback fonts. Size images explicitly and use Astro's
   image pipeline when image content exists.
4. Bound large content lists and payloads; paginate before reaching for client
   virtualization. Fetch independent server data concurrently when it exists.
5. Animate transform/opacity where needed and respect reduced motion. Do not
   invent animation or loading states for this static foundation.

Run the build and relevant [frontend-e2e](../frontend-e2e/SKILL.md) journeys. Check emitted assets for
accidental runtime libraries or secrets. Distinguish a smaller transfer from a
measured speed improvement; never claim a framework makes every page faster.
Related: [astro-development](../astro-development/SKILL.md), [frontend-architecture](../frontend-architecture/SKILL.md).
