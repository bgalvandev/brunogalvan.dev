// Isometric line-art workstation, drawn as a corner room. True 2:1 isometric
// projection, every solid on one vanishing geometry, everything in currentColor
// or a token so the drawing themes itself. Painter order: back to front.
import { writeFileSync } from 'node:fs';
import path from 'node:path';

// Draws the workstation that opens the home page and writes it as an Astro
// component. Run by hand (`pnpm run art:generate`) when the drawing changes;
// the output is committed so the build needs no generation step. Geometry is
// computed rather than hand-placed, so every solid shares one projection.

const COS = Math.cos(Math.PI / 6);
const U = 27;
const b = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
const p = (x, y, z) => {
  const sx = (x - y) * COS * U;
  const sy = ((x + y) * 0.5 - z) * U;
  b.minX = Math.min(b.minX, sx);
  b.maxX = Math.max(b.maxX, sx);
  b.minY = Math.min(b.minY, sy);
  b.maxY = Math.max(b.maxY, sy);
  return [sx.toFixed(1), sy.toFixed(1)];
};
const pt = (x, y, z) => p(x, y, z).join(',');
const poly = (pts, cls) =>
  `<polygon class="${cls}" points="${pts.map((q) => pt(...q)).join(' ')}"/>`;
const line = (a, c, cls) => {
  const [x1, y1] = p(...a),
    [x2, y2] = p(...c);
  return `<line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
};
// Top face plus the two faces a viewer at this angle can see.
const slab = (x, y, z, w, d, h, cls) =>
  poly(
    [
      [x, y, z + h],
      [x + w, y, z + h],
      [x + w, y + d, z + h],
      [x, y + d, z + h],
    ],
    `${cls} f-top`,
  ) +
  poly(
    [
      [x, y + d, z + h],
      [x + w, y + d, z + h],
      [x + w, y + d, z],
      [x, y + d, z],
    ],
    `${cls} f-front`,
  ) +
  poly(
    [
      [x + w, y, z + h],
      [x + w, y + d, z + h],
      [x + w, y + d, z],
      [x + w, y, z],
    ],
    `${cls} f-side`,
  );

const W = 12,
  D = 10,
  H = 7.2;
const g = [];

// Room: floor, the two walls a corner shows, and a lattice on each.
g.push('<g class="room">');
g.push(
  poly(
    [
      [0, 0, 0],
      [W, 0, 0],
      [W, D, 0],
      [0, D, 0],
    ],
    'wall f-floor',
  ),
);
g.push(
  poly(
    [
      [0, 0, 0],
      [W, 0, 0],
      [W, 0, H],
      [0, 0, H],
    ],
    'wall f-back',
  ),
);
g.push(
  poly(
    [
      [0, 0, 0],
      [0, D, 0],
      [0, D, H],
      [0, 0, H],
    ],
    'wall f-left',
  ),
);
let rules = '';
for (let i = 3; i < W; i += 3) {
  rules += line([i, 0, 0], [i, D, 0], 'rule');
  rules += line([i, 0, 0], [i, 0, H], 'rule');
}
for (let j = 3; j < D; j += 3) {
  rules += line([0, j, 0], [W, j, 0], 'rule');
  rules += line([0, j, 0], [0, j, H], 'rule');
}
for (let k = 3; k < H; k += 3) {
  rules += line([0, 0, k], [W, 0, k], 'rule');
  rules += line([0, 0, k], [0, D, k], 'rule');
}
g.push(`<g class="grid">${rules}</g></g>`);

// Wall shelf with two books, against the back wall.
g.push('<g class="props-back">');
g.push(slab(1.2, 0, 5.4, 3.2, 1.0, 0.18, 'solid'));
g.push(slab(1.7, 0.15, 5.58, 0.3, 0.6, 1.0, 'solid'));
g.push(slab(2.15, 0.15, 5.58, 0.3, 0.6, 0.78, 'solid'));
g.push(slab(2.6, 0.15, 5.58, 0.34, 0.6, 0.92, 'solid'));
g.push('</g>');

// Desk.
g.push('<g class="desk">');
g.push(slab(1, 1.2, 4.3, 10, 4.2, 0.28, 'solid'));
for (const [lx, ly] of [
  [1.25, 1.45],
  [10.5, 1.45],
  [1.25, 5.15],
  [10.5, 5.15],
])
  g.push(line([lx, ly, 0], [lx, ly, 4.3], 'edge'));
g.push('</g>');

// Screens. Code rows are separate lines so they can be typed in sequence.
function monitor(x, y, z, w, h) {
  let s = poly(
    [
      [x, y, z + h],
      [x + w, y, z + h],
      [x + w, y, z],
      [x, y, z],
    ],
    'screen',
  );
  s += poly(
    [
      [x + 0.18, y, z + h - 0.18],
      [x + w - 0.18, y, z + h - 0.18],
      [x + w - 0.18, y, z + 0.18],
      [x + 0.18, y, z + 0.18],
    ],
    'glow',
  );
  const rows = 7;
  for (let i = 0; i < rows; i++) {
    const zz = z + h - 0.62 - (i * (h - 1.1)) / rows;
    const len = [0.6, 0.36, 0.72, 0.48, 0.28, 0.64, 0.42][i] * (w - 1.1);
    const ind = i === 2 || i === 4 ? 0.85 : 0.4;
    s += line(
      [x + ind, y, zz],
      [x + ind + len, y, zz],
      `code code-${i}`,
    ).replace('<line ', '<line pathLength="1" ');
  }
  s += line([x + w / 2, y, z], [x + w / 2, y + 0.8, z - 0.95], 'edge');
  s += slab(x + w / 2 - 0.8, y + 0.45, 4.58, 1.6, 0.7, 0.05, 'solid');
  return s;
}
g.push(
  `<g class="screens">${monitor(2.4, 1.9, 4.85, 4.3, 2.9)}${monitor(7.0, 2.2, 4.85, 3.5, 2.4)}</g>`,
);

// Keyboard, mouse, mug.
g.push('<g class="tools">');
g.push(slab(3.9, 4.2, 4.58, 3.4, 1.1, 0.1, 'solid'));
g.push(slab(7.8, 4.35, 4.58, 0.6, 0.9, 0.12, 'solid'));
g.push(slab(1.5, 4.2, 4.58, 0.75, 0.75, 0.95, 'solid'));
g.push('</g>');

// Chair: seat, column, base, and a back that stays open so the desk reads.
g.push('<g class="chair">');
g.push(slab(4.9, 6.9, 1.95, 2.1, 1.8, 0.22, 'solid'));
g.push(line([5.95, 7.8, 0.12], [5.95, 7.8, 1.95], 'edge'));
for (const [ax, ay] of [
  [5.15, 7.1],
  [6.75, 7.1],
  [5.15, 8.5],
  [6.75, 8.5],
])
  g.push(line([5.95, 7.8, 0.14], [ax, ay, 0.08], 'edge'));
g.push(slab(5.0, 8.5, 2.17, 1.9, 0.2, 1.35, 'solid'));
g.push('</g>');

// Plant in the near corner.
g.push('<g class="plant">');
g.push(slab(10.1, 7.9, 0, 1.1, 1.1, 0.95, 'solid'));
for (const [dx, dy, dz] of [
  [0.15, 0.5, 2.5],
  [0.9, 0.55, 2.2],
  [0.5, 0.2, 2.75],
  [0.55, 0.9, 2.3],
])
  g.push(line([10.65, 8.45, 0.95], [10.1 + dx, 7.9 + dy, dz], 'leaf'));
g.push('</g>');

// Two small living details: steam off the mug, a caret on the near screen.
g.push('<g class="steam">');
g.push(
  `<path class="puff p1" d="${(() => {
    const a = p(1.85, 4.55, 1.6),
      c = p(1.85, 4.55, 2.9);
    return `M${a} C ${Number(a[0]) - 9},${Number(a[1]) - 14} ${Number(c[0]) + 9},${Number(c[1]) + 14} ${c}`;
  })()}"/>`,
);
g.push(
  `<path class="puff p2" d="${(() => {
    const a = p(2.1, 4.75, 1.6),
      c = p(2.1, 4.75, 2.7);
    return `M${a} C ${Number(a[0]) + 8},${Number(a[1]) - 12} ${Number(c[0]) - 8},${Number(c[1]) + 12} ${c}`;
  })()}"/>`,
);
g.push('</g>');
g.push(
  `<g class="caret">${line([3.25, 1.9, 6.05], [3.25, 1.9, 6.45], 'code')}</g>`,
);

const pad = 16;
const svg = `<svg viewBox="${(b.minX - pad).toFixed(1)} ${(b.minY - pad).toFixed(1)} ${(b.maxX - b.minX + pad * 2).toFixed(1)} ${(b.maxY - b.minY + pad * 2).toFixed(1)}" fill="none" xmlns="http://www.w3.org/2000/svg" class="scene" aria-hidden="true" focusable="false">
${g.join('\n')}
</svg>`;
const target =
  process.argv[2] ??
  path.resolve(import.meta.dirname, '../../src/modules/home/workstation.astro');
writeFileSync(
  target,
  `---\n// Generated by scripts/build/workstation.mjs - edit that, not this file.\n---\n\n${svg}\n`,
);
console.log(`${path.relative(process.cwd(), target)} (${svg.length} bytes)`);
