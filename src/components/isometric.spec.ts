import { describe, expect, it } from 'vitest';

import { box, cylinder, faces, rasterize, runs } from './isometric';

describe('isometric solids', () => {
  it('shows a box by its top and the two faces turned to the viewer, top last', () => {
    const scene = faces([box(0, 0, 0, 2, 2, 2)]);
    expect(scene.map((face) => face.kind).sort()).toEqual([
      'left',
      'right',
      'top',
    ]);
    expect(scene.at(-1)?.kind).toBe('top');
  });
  it('draws a cylinder with one seamless side, however many segments it has', () => {
    const scene = faces([cylinder(0, 0, 0, 2, 3)]);
    expect(scene.map((face) => face.kind)).toEqual(['left', 'top']);
  });
  it('keeps paint order: a later solid covers an earlier one', () => {
    const scene = faces([box(0, 0, 0, 2, 2, 2), box(0, 0, 3, 2, 2, 2)]);
    expect(scene.slice(0, 3).every((face) => face.solid === 0)).toBe(true);
    expect(scene.slice(3).every((face) => face.solid === 1)).toBe(true);
  });
});

describe('pixel drawing', () => {
  it('leaves a gap where one solid meets another in front of it', () => {
    const grid = rasterize(
      faces([box(0, 0, 0, 4, 4, 1), box(0, 0, 1, 4, 4, 1)]),
      24,
    );
    const column = grid.map((row) => row[12]);
    // Down the middle: the upper block, a gap, then the lower block again.
    const firstGap = column.findIndex(
      (cell, index) => index > 0 && cell === null && column[index - 1] !== null,
    );
    expect(firstGap).toBeGreaterThan(0);
    expect(column.slice(firstGap).some((cell) => cell !== null)).toBe(true);
  });
  it('merges each run of cells into one rectangle', () => {
    expect(
      runs(
        [
          ['top', 'top', null, 'left'],
          [null, 'top', 'top', 'top'],
        ],
        ['top'],
      ),
    ).toBe('M0 0h2v1h-2zM1 1h3v1h-3z');
  });
});
