import { colors } from './colors';

function hexToRgb(hex: string) {
  const value = parseInt(hex.slice(1), 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
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

// Soft, abstract gradient across the 1-10 range. No emoji, no traffic-light coding.
export function scoreColor(score: number): string {
  const clamped = Math.min(10, Math.max(1, score));
  const t = (clamped - 1) / 9;
  if (t <= 0.5) {
    return mix(colors.scoreLow, colors.scoreMid, t / 0.5);
  }
  return mix(colors.scoreMid, colors.scoreHigh, (t - 0.5) / 0.5);
}
