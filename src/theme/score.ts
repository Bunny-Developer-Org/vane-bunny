import type { Palette } from './palettes';

function hexToRgb(hex: string) {
  const value = parseInt(hex.slice(1), 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

// Multiplies each channel toward black — used where a UI element needs to
// read as a darker shade of an existing accent color rather than a new color.
export function darken(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const factor = 1 - amount;
  return `rgb(${Math.round(r * factor)}, ${Math.round(g * factor)}, ${Math.round(b * factor)})`;
}

function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

function mix(hexA: string, hexB: string, t: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const r = lerp(a.r, b.r, t);
  const g = lerp(a.g, b.g, t);
  const bl = lerp(a.b, b.b, t);
  return `rgb(${r}, ${g}, ${bl})`;
}

// Soft, abstract gradient across the 1-10 range. No emoji, no traffic-light
// coding. Takes the active palette's gradient stops so it follows theme
// changes.
export function scoreColor(
  score: number,
  palette: Pick<Palette, 'scoreLow' | 'scoreMid' | 'scoreHigh'>,
): string {
  const clamped = Math.min(10, Math.max(1, score));
  const t = (clamped - 1) / 9;
  if (t <= 0.5) {
    return mix(palette.scoreLow, palette.scoreMid, t / 0.5);
  }
  return mix(palette.scoreMid, palette.scoreHigh, (t - 0.5) / 0.5);
}
