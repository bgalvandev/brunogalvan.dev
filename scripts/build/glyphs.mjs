import { writeFileSync } from 'node:fs';
import path from 'node:path';

// One glyph per capability, drawn on the same 2:1 isometric projection as the
// workstation so the whole page is one drawing. Run by hand
// (`pnpm run art:generate`); the output is committed.
const COS = Math.cos(Math.PI / 6);
const U = 9;

function drawing() {
  const b = {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
  };
  const out = [];
  const p = (x, y, z) => {
    const sx = (x - y) * COS * U;
    const sy = ((x + y) * 0.5 - z) * U;
    b.minX = Math.min(b.minX, sx);
    b.maxX = Math.max(b.maxX, sx);
    b.minY = Math.min(b.minY, sy);
    b.maxY = Math.max(b.maxY, sy);
    return `${sx.toFixed(1)},${sy.toFixed(1)}`;
  };
  const api = {
    poly: (pts, cls = 'g-face') => {
      out.push(
        `<polygon class="${cls}" points="${pts.map((q) => p(...q)).join(' ')}"/>`,
      );
      return api;
    },
    line: (a, c, cls = 'g-edge') => {
      const [x1, y1] = p(...a).split(','),
        [x2, y2] = p(...c).split(',');
      out.push(
        `<line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`,
      );
      return api;
    },
    slab: (x, y, z, w, d, h, cls = '') => {
      api.poly(
        [
          [x, y, z + h],
          [x + w, y, z + h],
          [x + w, y + d, z + h],
          [x, y + d, z + h],
        ],
        `g-top ${cls}`,
      );
      if (h > 0) {
        api.poly(
          [
            [x, y + d, z + h],
            [x + w, y + d, z + h],
            [x + w, y + d, z],
            [x, y + d, z],
          ],
          `g-front ${cls}`,
        );
        api.poly(
          [
            [x + w, y, z + h],
            [x + w, y + d, z + h],
            [x + w, y + d, z],
            [x + w, y, z],
          ],
          `g-side ${cls}`,
        );
      }
      return api;
    },
    // A circle in this projection is an ellipse; used for the store's disks.
    disk: (x, y, z, r, cls = 'g-face') => {
      const [cx, cy] = p(x, y, z).split(',');
      out.push(
        `<ellipse class="${cls}" cx="${cx}" cy="${cy}" rx="${(r * COS * U * 2).toFixed(1)}" ry="${(r * U).toFixed(1)}"/>`,
      );
      b.minX = Math.min(b.minX, Number(cx) - r * COS * U * 2);
      b.maxX = Math.max(b.maxX, Number(cx) + r * COS * U * 2);
      b.minY = Math.min(b.minY, Number(cy) - r * U);
      b.maxY = Math.max(b.maxY, Number(cy) + r * U);
      return api;
    },
    // Bounds travel with the drawing so every glyph can share one box; a glyph
    // that fitted its own would sit at a different scale from its siblings.
    done: () => ({ bounds: b, body: out.join('') }),
  };
  return api;
}

const glyphs = {
  // A surface with a title bar and two content bands: the rendered page.
  frontend: () => {
    const d = drawing();
    d.slab(0, 0, 0, 7, 5, 0.5);
    d.line([0, 1.1, 0.5], [7, 1.1, 0.5], 'g-rule');
    d.slab(0.7, 1.9, 0.5, 2.4, 2.4, 0.35, 'g-lit');
    d.slab(3.9, 1.9, 0.5, 2.4, 1.0, 0.35);
    d.slab(3.9, 3.3, 0.5, 2.4, 1.0, 0.35);
    return d.done();
  },
  // Three racked units, the top one live.
  backend: () => {
    const d = drawing();
    for (let i = 0; i < 3; i++)
      d.slab(0, 0, i * 1.5, 6, 4, 1.0, i === 2 ? 'g-lit' : '');
    for (let i = 0; i < 3; i++)
      d.line([0.6, 4, i * 1.5 + 0.5], [2.2, 4, i * 1.5 + 0.5], 'g-rule');
    return d.done();
  },
  // Stacked disks: the store.
  data: () => {
    const d = drawing();
    for (const z of [0, 1.4, 2.8]) {
      d.disk(2.5, 2.5, z, 2.6);
      d.line([0, 2.5, z], [0, 2.5, z + 1.4], 'g-edge');
      d.line([5, 2.5, z], [5, 2.5, z + 1.4], 'g-edge');
    }
    d.disk(2.5, 2.5, 4.2, 2.6, 'g-face g-lit');
    return d.done();
  },
  // A graph: nodes wired to one lit centre.
  ai: () => {
    const d = drawing();
    const nodes = [
      [0, 0],
      [5.2, 0],
      [0, 5.2],
      [5.2, 5.2],
      [2.6, 2.6],
    ];
    for (const [x, y] of nodes.slice(0, 4))
      d.line([x + 0.7, y + 0.7, 0.7], [3.3, 3.3, 0.7], 'g-rule');
    for (const [x, y] of nodes)
      d.slab(x, y, 0, 1.4, 1.4, 1.4, x === 2.6 ? 'g-lit' : '');
    return d.done();
  },
  // Nested planes: the layers, each smaller and higher than the last.
  architecture: () => {
    const d = drawing();
    const steps = [
      [0, 0, 0, 7],
      [0.9, 0.9, 1.2, 5.2],
      [1.8, 1.8, 2.4, 3.4],
      [2.7, 2.7, 3.6, 1.6],
    ];
    steps.forEach(([x, y, z, s], i) =>
      d.slab(x, y, z, s, s, 0.45, i === 3 ? 'g-lit' : ''),
    );
    return d.done();
  },
  // A sealed unit with its lid raised: build, ship, verify.
  platform: () => {
    const d = drawing();
    d.slab(0, 0, 0, 5, 5, 2.2);
    d.slab(-0.35, -0.35, 3.3, 5.7, 5.7, 0.4, 'g-lit');
    d.line([0.2, 0.2, 2.2], [0.2, 0.2, 3.3], 'g-rule');
    d.line([4.8, 4.8, 2.2], [4.8, 4.8, 3.3], 'g-rule');
    return d.done();
  },
};

const built = Object.entries(glyphs).map(([name, build]) => ({
  name,
  ...build(),
}));
// One square box, sized by the widest drawing in the set and centred on each,
// so the six read as one family at one scale.
const pad = 8;
const span =
  Math.max(
    ...built.flatMap(({ bounds }) => [
      bounds.maxX - bounds.minX,
      bounds.maxY - bounds.minY,
    ]),
  ) +
  pad * 2;
const entries = built.map(({ name, bounds, body }) => {
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  const box = `${(cx - span / 2).toFixed(1)} ${(cy - span / 2).toFixed(1)} ${span.toFixed(1)} ${span.toFixed(1)}`;
  return `  ${name}: { box: '${box}', body: \`${body}\` },`;
});

const file = `---
// Generated by scripts/build/glyphs.mjs - edit that, not this file.
interface Props {
  name: keyof typeof glyphs;
  class?: string;
}
const glyphs = {
${entries.join('\n')}
} as const;
const { name, class: className } = Astro.props;
const glyph = glyphs[name];
---

<svg
  class:list={['glyph', className]}
  viewBox={glyph.box}
  fill="none"
  aria-hidden="true"
  focusable="false"
  set:html={glyph.body}
/>
`;

const target =
  process.argv[2] ??
  path.resolve(import.meta.dirname, '../../src/components/glyph.astro');
writeFileSync(target, file);
console.log(
  `${path.relative(process.cwd(), target)} (${Object.keys(glyphs).length} glyphs)`,
);
