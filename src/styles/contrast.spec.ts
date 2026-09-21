import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// The browser suite catches a contrast regression only once axe runs against a
// rendered page. Reading the declared pairs is cheaper and fails on the token
// itself, which is where the mistake is made.
const tokens = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');

function pair(name: string): [string, string] {
  const match = new RegExp(
    `--${name}:\\s*light-dark\\((#[0-9a-f]{6}),\\s*(#[0-9a-f]{6})\\)`,
    'i',
  ).exec(tokens);
  if (!match?.[1] || !match[2]) {
    throw new Error(`No light-dark hex pair declared for --${name}`);
  }
  return [match[1], match[2]];
}

function luminance(hex: string): number {
  const channels = (hex.slice(1).match(/../g) ?? []).map((part) => {
    const value = parseInt(part, 16) / 255;
    return value <= 0.04045
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  const [r = 0, g = 0, b = 0] = channels;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((high ?? 0) + 0.05) / ((low ?? 0) + 0.05);
}

const [paperLight, paperDark] = pair('paper');
const [surfaceLight, surfaceDark] = pair('surface');

describe('semantic colour tokens', () => {
  // WCAG 2.1 AA for body text. Every token that paints text is covered; a new
  // text token must be added here or it ships unchecked.
  it.each(['ink', 'muted', 'faint'])(
    '--%s reads against both canvases in both themes',
    (name) => {
      const [light, dark] = pair(name);
      const combinations: [string, string][] = [
        [light, paperLight],
        [light, surfaceLight],
        [dark, paperDark],
        [dark, surfaceDark],
      ];
      for (const [fg, bg] of combinations) {
        expect(
          contrast(fg, bg),
          `${name} ${fg} on ${bg}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    },
  );

  it('keeps the portrait plate legible, since it is dark in both themes', () => {
    const [screenLight, screenDark] = pair('screen');
    const [inkLight, inkDark] = pair('screen-ink');
    expect(contrast(inkLight, screenLight)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(inkDark, screenDark)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps the accent legible against its own contrast colour', () => {
    const [accentLight, accentDark] = pair('accent');
    const [onLight, onDark] = pair('accent-contrast');
    expect(contrast(accentLight, onLight)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(accentDark, onDark)).toBeGreaterThanOrEqual(4.5);
  });
});
