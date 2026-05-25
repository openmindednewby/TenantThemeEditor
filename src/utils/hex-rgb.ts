/**
 * Hex-to-RGB space-separated conversion utilities.
 * Used for injecting CSS custom properties that work with Tailwind's
 * `rgb(var(--color) / <alpha>)` syntax.
 */

const HEX_RADIX = 16;
const HEX_REGEX = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

/** Convert hex (#rrggbb) to space-separated RGB string ("r g b"). */
export function hexToRgbString(hex: string): string {
  const match = HEX_REGEX.exec(hex);
  if (!match?.[1] || !match[2] || !match[3]) return '0 0 0';
  return `${parseInt(match[1], HEX_RADIX)} ${parseInt(match[2], HEX_RADIX)} ${parseInt(match[3], HEX_RADIX)}`;
}

/** Convert space-separated RGB ("r g b") to hex string ("#rrggbb"). */
export function rgbStringToHex(rgb: string): string {
  const parts = rgb.split(' ').map(Number);
  const r = parts[0];
  const g = parts[1];
  const b = parts[2];
  if (r === undefined || g === undefined || b === undefined) return '#000000';
  return `#${[r, g, b].map((x) => x.toString(HEX_RADIX).padStart(2, '0')).join('')}`;
}
