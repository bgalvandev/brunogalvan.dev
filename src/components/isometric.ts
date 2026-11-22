// Isometric solids for the card icons, drawn at build time. A solid is a prism:
// a polygon pushed out along an axis (a box, a cylinder, an upright profile). The same scene
// renders two ways, as a line drawing (each visible face filled with the
// paper and outlined) and as pixels (each visible face rasterized onto a
// grid), so an icon can swap from one to the other and keep its shape.

export type Point = readonly [number, number];

export interface Solid {
  /**
   * The polygon that is pushed out: on the ground plane (x, y) for a solid
   * that stands up, or in the upright plane (x, z) for one that is pushed
   * back along y.
   */
  readonly base: readonly Point[];
  readonly axis: 'z' | 'y';
  /** Where the push starts along its axis, and how far it goes. */
  readonly from: number;
  readonly length: number;
  /** A curved side (a cylinder) is one face, drawn without seams. */
  readonly smooth: boolean;
}

type FaceKind = 'top' | 'left' | 'right';

export interface Face {
  readonly kind: FaceKind;
  readonly points: readonly Point[];
  /** The solid the face belongs to, so its outline can follow the solid. */
  readonly solid: number;
}

export function box(
  x: number,
  y: number,
  z: number,
  width: number,
  depth: number,
  height: number,
): Solid {
  return {
    base: [
      [x, y],
      [x + width, y],
      [x + width, y + depth],
      [x, y + depth],
    ],
    axis: 'z',
    from: z,
    length: height,
    smooth: false,
  };
}

export function cylinder(
  x: number,
  y: number,
  z: number,
  radius: number,
  height: number,
): Solid {
  const base = Array.from({ length: 48 }, (_, index): Point => {
    const angle = (index / 48) * Math.PI * 2;
    return [x + radius * Math.cos(angle), y + radius * Math.sin(angle)];
  });
  return { base, axis: 'z', from: z, length: height, smooth: true };
}

/** An upright (x, z) profile, from `y` forward to `y + depth`. */
export function extrude(
  profile: readonly Point[],
  y: number,
  depth: number,
): Solid {
  return { base: profile, axis: 'y', from: y, length: depth, smooth: false };
}

// +x runs to the lower right, +y to the lower left, z up: the viewer looks
// down the (1, 1, 1) diagonal, so the faces turned to +x, +y and +z show.
const COS = Math.cos(Math.PI / 6);
function project(x: number, y: number, z: number): Point {
  return [(x - y) * COS, (x + y) / 2 - z];
}

function counterClockwise(base: readonly Point[]): readonly Point[] {
  const area = base.reduce((sum, [x, y], index) => {
    const [nextX, nextY] = base[(index + 1) % base.length]!;
    return sum + x * nextY - nextX * y;
  }, 0);
  return area >= 0 ? base : [...base].reverse();
}

// A point of a solid's polygon at a position along its axis, in world space.
function lift(solid: Solid, [a, b]: Point, along: number) {
  return solid.axis === 'z' ? project(a, b, along) : project(a, along, b);
}

/** The visible faces of a scene, far to near, ready to paint in order. */
export function faces(solids: readonly Solid[]): Face[] {
  return solids.flatMap((solid, index) => {
    const base = counterClockwise(solid.base);
    // The cap at the far end of the push faces the viewer: the top of a
    // standing solid, the front (the +y end) of an upright one.
    const near = solid.from + solid.length;
    const far = solid.from;
    const sides = base.flatMap((start, position) => {
      const end = base[(position + 1) % base.length]!;
      // The outward normal of a counter-clockwise edge, in the polygon's
      // plane; its two parts are x and y (standing) or x and z (upright).
      const normal: Point = [end[1] - start[1], start[0] - end[0]];
      if (normal[0] + normal[1] <= 1e-9) return [];
      const kind: FaceKind =
        solid.axis === 'z'
          ? normal[0] > normal[1]
            ? 'right'
            : 'left'
          : normal[1] > normal[0]
            ? 'top'
            : 'right';
      return [
        {
          position,
          depth: start[0] + end[0] + start[1] + end[1],
          kind,
          points: [
            lift(solid, start, near),
            lift(solid, end, near),
            lift(solid, end, far),
            lift(solid, start, far),
          ],
        },
      ];
    });
    const cap: Face = {
      kind: solid.axis === 'z' ? 'top' : 'left',
      points: base.map((point) => lift(solid, point, near)),
      solid: index,
    };
    if (solid.smooth && sides.length > 0) {
      // A convex base shows one unbroken run of sides; start it after the
      // gap so the upper edge and the lower edge each read as one curve.
      const gap = sides.findIndex(
        (side, at) => at > 0 && side.position !== sides[at - 1]!.position + 1,
      );
      const start = Math.max(gap, 0);
      const run = [...sides.slice(start), ...sides.slice(0, start)];
      const upper = [run[0]!.points[0]!, ...run.map((side) => side.points[1]!)];
      const lower = [run[0]!.points[3]!, ...run.map((side) => side.points[2]!)];
      const side: Face = {
        kind: 'left',
        points: [...upper, ...lower.reverse()],
        solid: index,
      };
      return [side, cap];
    }
    return [
      ...sides
        .sort((a, b) => a.depth - b.depth)
        .map(({ kind, points }) => ({ kind, points, solid: index })),
      cap,
    ];
  });
}

export interface Bounds {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export function bounds(scene: readonly Face[]): Bounds {
  const points = scene.flatMap((face) => face.points);
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return {
    x,
    y,
    width: Math.max(...xs) - x,
    height: Math.max(...ys) - y,
  };
}

function inside([x, y]: Point, polygon: readonly Point[]): boolean {
  let within = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]!;
    const [xj, yj] = polygon[j]!;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      within = !within;
    }
  }
  return within;
}

export type Cell = FaceKind | null;

/**
 * The scene on a grid `columns` cells wide. A cell takes the nearest face
 * over its centre and that face's kind. Where a solid meets one painted in
 * front of it, the cell behind is left empty, so every piece stands apart by
 * a one-cell gap.
 */
export function rasterize(scene: readonly Face[], columns: number): Cell[][] {
  const box = bounds(scene);
  const size = box.width / columns;
  const rows = Math.ceil(box.height / size);
  const owner = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: columns }, (_, column) => {
      const centre: Point = [
        box.x + (column + 0.5) * size,
        box.y + (row + 0.5) * size,
      ];
      return scene.findLastIndex((face) => inside(centre, face.points));
    }),
  );
  return owner.map((line, row) =>
    line.map((face, column) => {
      if (face < 0) return null;
      const solid = scene[face]!.solid;
      const behind = [
        owner[row - 1]?.[column],
        owner[row + 1]?.[column],
        line[column - 1],
        line[column + 1],
      ].some(
        (other) =>
          other !== undefined && other > face && scene[other]!.solid !== solid,
      );
      return behind ? null : scene[face]!.kind;
    }),
  );
}

/** Rows of cells as one compact path per kind: a rectangle per run. */
export function runs(grid: readonly Cell[][], kinds: readonly Cell[]): string {
  return grid
    .flatMap((line, row) => {
      const found: string[] = [];
      let column = 0;
      while (column < line.length) {
        if (!kinds.includes(line[column] ?? null)) {
          column += 1;
          continue;
        }
        const start = column;
        while (column < line.length && kinds.includes(line[column] ?? null)) {
          column += 1;
        }
        found.push(`M${start} ${row}h${column - start}v1h${start - column}z`);
      }
      return found;
    })
    .join('');
}

// Each drawing numbers its grid pattern, so ids stay unique on a page and the
// build stays the same from one run to the next.
let drawings = 0;
export function drawingId() {
  drawings += 1;
  return `iso-grid-${drawings}`;
}
