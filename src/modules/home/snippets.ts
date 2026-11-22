// Code from this site's own repository, verbatim, pinned to the commit it was
// read at so the excerpt can never drift from its source. `lines` marks an
// excerpt from a longer file; without it the file is whole.
export const snippets = [
  {
    id: 'ts',
    lang: 'ts',
    repository: 'bgalvandev/brunogalvan.dev',
    commit: '3fadbdb3c298e73263af1a072852ce54fbbd7841',
    path: 'src/data/figures.ts',
    code: "import { roles, type Month } from './experience';\nimport { projects } from './projects';\nimport { stack } from './stack';\n\n// Every figure the site states is computed here from the record, at build\n// time, so a number can never contradict the roles and projects under it.\nconst toMonths = (month: Month) => {\n  const [year, index] = month.split('-').map(Number);\n  return (year ?? 0) * 12 + (index ?? 1) - 1;\n};\nconst monthOf = (date: Date): Month =>\n  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}` as Month;\n\n// How long a role lasted, in whole months, counting its first and last month;\n// an open role runs to the current month.\nexport function roleMonths(\n  role: { start: Month; end: Month | null },\n  today: Date,\n) {\n  const end = role.end ? toMonths(role.end) : toMonths(monthOf(today));\n  return end - toMonths(role.start) + 1;\n}\n\nexport function figures(today: Date) {\n  const now = toMonths(monthOf(today));\n  const first = Math.min(...roles.map((role) => toMonths(role.start)));\n  return {\n    yearsSinceFirstRole: Math.floor((now - first) / 12),\n    firstYear: Math.floor(first / 12),\n    companies: new Set(roles.map((role) => role.company)).size,\n    projects: projects.length,\n    publicProjects: projects.filter((project) => project.repository).length,\n    technologies: Object.values(stack).flat().length,\n  };\n}\n\n// One entry per month from the first role to today: the role held that month\n// and how many months into it, or null for a month between roles.\nexport function career(today: Date) {\n  const now = toMonths(monthOf(today));\n  const first = Math.min(...roles.map((role) => toMonths(role.start)));\n  return Array.from({ length: now - first + 1 }, (_, offset) => {\n    const month = first + offset;\n    const role = roles.find(\n      (candidate) =>\n        toMonths(candidate.start) <= month &&\n        month <= (candidate.end ? toMonths(candidate.end) : now),\n    );\n    return {\n      year: Math.floor(month / 12),\n      month: month % 12,\n      role: role?.id ?? null,\n      tenure: role ? month - toMonths(role.start) + 1 : 0,\n    };\n  });\n}",
  },
  {
    id: 'astro',
    lang: 'astro',
    repository: 'bgalvandev/brunogalvan.dev',
    commit: '3fadbdb3c298e73263af1a072852ce54fbbd7841',
    path: 'src/components/headline.astro',
    code: "---\n// The section statement: two short sentences between decorative slashes. The\n// slashes are generated content with an empty text alternative, so they are\n// neither read aloud nor measured as text. The name lives on the heading and\n// the visual copy is hidden, so the per-character reveal never reaches\n// assistive technology and the phrase reads whole.\ninterface Props {\n  lines: readonly string[];\n  id?: string;\n  level?: 'h1' | 'h2' | 'h3';\n  size?: 'headline' | 'display';\n}\nconst { lines, id, level: Tag = 'h2', size = 'headline' } = Astro.props;\n---\n\n<Tag\n  class:list={['headline', `text-${size}`]}\n  id={id}\n  aria-label={lines.join(' ')}\n>\n  <span class=\"headline-lines\" aria-hidden=\"true\" data-reveal>\n    {lines.map((line, index) => (\n      <>\n        {index > 0 && ' '}\n        <span class=\"headline-line\">{line}</span>\n      </>\n    ))}\n  </span>\n</Tag>\n\n<style>\n  .headline {\n    margin: 0;\n  }\n  /* Each sentence is its own block and balances alone, so neither ends on a\n     word by itself; the slashes open the first and close the last. */\n  .headline-lines,\n  .headline-line {\n    display: block;\n  }\n  .headline-line {\n    text-wrap: balance;\n  }\n  .headline-line:first-child::before,\n  .headline-line:last-child::after {\n    color: var(--decor);\n    font-family: var(--font-pixel);\n  }\n  /* The slash alone, a Geist space's width from the words (0.19em), where\n     a no-break space set in the pixel face would open a wider gap. */\n  .headline-line:first-child::before {\n    content: '/' / '';\n    margin-inline-end: 0.19em;\n  }\n  .headline-line:last-child::after {\n    content: '/' / '';\n    margin-inline-start: 0.19em;\n  }\n</style>",
  },
  {
    id: 'playwright',
    lang: 'ts',
    repository: 'bgalvandev/brunogalvan.dev',
    commit: '3fadbdb3c298e73263af1a072852ce54fbbd7841',
    path: 'e2e/foundation.spec.ts',
    lines: [92, 117],
    code: "  for (const colorScheme of ['light', 'dark'] as const) {\n    test(`${locale}: accessible ${colorScheme} page without overflow`, async ({\n      page,\n    }) => {\n      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });\n      await page.goto(`/${locale}/`);\n      // The bar and the phone menu each hold one, and both tell the scheme.\n      const toggles = page.locator('[data-theme-toggle]');\n      await expect(toggles).toHaveCount(2);\n      for (const toggle of await toggles.all()) {\n        await expect(toggle).toHaveAttribute(\n          'aria-pressed',\n          String(colorScheme === 'dark'),\n        );\n      }\n      const results = await new AxeBuilder({ page })\n        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])\n        .analyze();\n      expect(results.violations).toEqual([]);\n      expect(\n        await page.evaluate(\n          () => document.documentElement.scrollWidth <= window.innerWidth,\n        ),\n      ).toBe(true);\n    });\n  }",
  },
] as const;
