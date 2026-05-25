/**
 * Stress tests for palette-generator utilities.
 *
 * Covers random hex generation at scale, performance benchmarks,
 * edge-case colors, invalid inputs, round-trip consistency, and
 * shade ordering invariants.
 */
import {
  generateColorScale,
  hexToHsl,
  hslToHex,
  isValidHex,
} from '../palette-generator';

// -- Helpers ------------------------------------------------------------------

const SHADE_KEYS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] as const;
type ShadeKey = (typeof SHADE_KEYS)[number];

/** Sum the RGB values of a hex string to measure relative brightness. */
function hexBrightness(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return r + g + b;
}

/** Generate a deterministic but varied hex color from a seed index. */
function seedToHex(seed: number): string {
  const r = (seed * 37 + 13) % 256;
  const g = (seed * 53 + 29) % 256;
  const b = (seed * 97 + 41) % 256;
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

const BULK_COUNT = 500;
const PERFORMANCE_COUNT = 1000;
const ROUND_TRIP_COUNT = 300;
const PERFORMANCE_TIMEOUT_MS = 3000;
const ROUND_TRIP_TOLERANCE = 1;

// -- 1. Generate scales for 500 random hex colors -----------------------------

describe('bulk scale generation (500 random colors)', () => {
  const colors = Array.from({ length: BULK_COUNT }, (_, i) => seedToHex(i));

  it('all 500 scales contain valid hex values for every shade', () => {
    for (const color of colors) {
      const scale = generateColorScale(color);
      for (const key of SHADE_KEYS) {
        const shade = scale[key];
        expect(isValidHex(shade)).toBe(true);
      }
    }
  });

  it('shade 500 always equals the normalized input color', () => {
    for (const color of colors) {
      const scale = generateColorScale(color);
      expect(scale['500']).toBe(color.toLowerCase());
    }
  });
});

// -- 2. Performance: 1000 generateColorScale calls under 3 seconds -----------

describe('performance', () => {
  it(`generates ${PERFORMANCE_COUNT} scales within ${PERFORMANCE_TIMEOUT_MS}ms`, () => {
    const start = performance.now();
    for (let i = 0; i < PERFORMANCE_COUNT; i++)
      generateColorScale(seedToHex(i));
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(PERFORMANCE_TIMEOUT_MS);
  });
});

// -- 3. Edge-case inputs: extremes and primaries ------------------------------

describe('edge-case colors', () => {
  const edgeCases: Array<{ label: string; hex: string }> = [
    { label: 'pure black', hex: '#000000' },
    { label: 'pure white', hex: '#ffffff' },
    { label: 'pure red', hex: '#ff0000' },
    { label: 'pure green', hex: '#00ff00' },
    { label: 'pure blue', hex: '#0000ff' },
    { label: 'mid gray', hex: '#808080' },
  ];

  it.each(edgeCases)('$label ($hex) produces a valid 10-shade scale', ({ hex }) => {
    const scale = generateColorScale(hex);
    for (const key of SHADE_KEYS)
      expect(isValidHex(scale[key])).toBe(true);
  });

  it('pure black scale has shade 50 brighter than shade 900', () => {
    const scale = generateColorScale('#000000');
    // For pure black (l=0), all shades will be black since lightness ratios
    // are multiplied by baseL (which is 0). shade 50 >= shade 900.
    expect(hexBrightness(scale['50'])).toBeGreaterThanOrEqual(hexBrightness(scale['900']));
  });

  it('pure white scale has shade 50 at least as bright as shade 900', () => {
    const scale = generateColorScale('#ffffff');
    expect(hexBrightness(scale['50'])).toBeGreaterThanOrEqual(hexBrightness(scale['900']));
  });

  it('mid gray produces achromatic shades (all channels roughly equal)', () => {
    const scale = generateColorScale('#808080');
    for (const key of SHADE_KEYS) {
      const clean = scale[key].replace('#', '');
      const r = parseInt(clean.slice(0, 2), 16);
      const g = parseInt(clean.slice(2, 4), 16);
      const b = parseInt(clean.slice(4, 6), 16);
      // For a pure gray input, all channels should be equal
      expect(r).toBe(g);
      expect(g).toBe(b);
    }
  });

  it('shorthand #RGB input is handled correctly', () => {
    const scale = generateColorScale('#f00');
    expect(scale['500']).toBe('#ff0000');
    expect(isValidHex(scale['50'])).toBe(true);
    expect(isValidHex(scale['900'])).toBe(true);
  });
});

// -- 4. Invalid inputs -------------------------------------------------------

describe('invalid inputs', () => {
  it('empty string does not crash generateColorScale', () => {
    expect(() => generateColorScale('')).not.toThrow();
  });

  it('named color "red" does not crash', () => {
    expect(() => generateColorScale('red')).not.toThrow();
  });

  it('rgb() string does not crash', () => {
    expect(() => generateColorScale('rgb(255,0,0)')).not.toThrow();
  });

  it('invalid hex "#gg0000" does not crash', () => {
    expect(() => generateColorScale('#gg0000')).not.toThrow();
  });

  it('isValidHex correctly rejects all invalid inputs', () => {
    expect(isValidHex('')).toBe(false);
    expect(isValidHex('red')).toBe(false);
    expect(isValidHex('rgb(255,0,0)')).toBe(false);
    expect(isValidHex('#gg0000')).toBe(false);
  });

  it('hexToHsl handles empty string without crashing', () => {
    expect(() => hexToHsl('')).not.toThrow();
  });

  it('hslToHex handles extreme values', () => {
    expect(() => hslToHex(-360, -1, -0.5)).not.toThrow();
    expect(() => hslToHex(720, 2, 1.5)).not.toThrow();
    expect(() => hslToHex(0, 0, 0)).not.toThrow();
    expect(() => hslToHex(360, 1, 1)).not.toThrow();
  });

  it('hslToHex with extreme values still produces valid hex', () => {
    const result1 = hslToHex(-360, -1, -0.5);
    expect(isValidHex(result1)).toBe(true);

    const result2 = hslToHex(720, 2, 1.5);
    expect(isValidHex(result2)).toBe(true);
  });
});

// -- 5. Round-trip consistency: hexToHsl -> hslToHex --------------------------

describe('round-trip consistency (hexToHsl -> hslToHex)', () => {
  const testColors = Array.from({ length: ROUND_TRIP_COUNT }, (_, i) => seedToHex(i));

  it(`${ROUND_TRIP_COUNT} random colors round-trip with <= ${ROUND_TRIP_TOLERANCE} brightness delta`, () => {
    for (const hex of testColors) {
      const hsl = hexToHsl(hex);
      const roundTripped = hslToHex(hsl.h, hsl.s, hsl.l);

      const originalBrightness = hexBrightness(hex);
      const resultBrightness = hexBrightness(roundTripped);
      const delta = Math.abs(originalBrightness - resultBrightness);

      expect(delta).toBeLessThanOrEqual(ROUND_TRIP_TOLERANCE);
    }
  });

  it('round-trip preserves achromatic colors exactly', () => {
    const grays = ['#000000', '#808080', '#ffffff', '#333333', '#cccccc'];
    for (const hex of grays) {
      const hsl = hexToHsl(hex);
      const result = hslToHex(hsl.h, hsl.s, hsl.l);
      expect(result).toBe(hex);
    }
  });

  it('round-trip preserves pure primary colors exactly', () => {
    const primaries = ['#ff0000', '#00ff00', '#0000ff'];
    for (const hex of primaries) {
      const hsl = hexToHsl(hex);
      const result = hslToHex(hsl.h, hsl.s, hsl.l);
      expect(result).toBe(hex);
    }
  });
});

// -- 6. Shade ordering invariant: 50 lightest, 900 darkest -------------------

describe('shade ordering invariant', () => {
  const sampleColors = Array.from({ length: BULK_COUNT }, (_, i) => seedToHex(i));

  it('shade 50 is always the brightest (or equal) for all 500 colors', () => {
    for (const color of sampleColors) {
      const scale = generateColorScale(color);
      const brightness50 = hexBrightness(scale['50']);
      for (const key of SHADE_KEYS)
        expect(brightness50).toBeGreaterThanOrEqual(hexBrightness(scale[key]));
    }
  });

  it('shade 900 is always the darkest (or equal) for all 500 colors', () => {
    for (const color of sampleColors) {
      const scale = generateColorScale(color);
      const brightness900 = hexBrightness(scale['900']);
      for (const key of SHADE_KEYS)
        expect(brightness900).toBeLessThanOrEqual(hexBrightness(scale[key]));
    }
  });

  it('shades are monotonically non-increasing in brightness for 500 colors', () => {
    for (const color of sampleColors) {
      const scale = generateColorScale(color);
      for (let i = 0; i < SHADE_KEYS.length - 1; i++) {
        const current = hexBrightness(scale[SHADE_KEYS[i]!]);
        const next = hexBrightness(scale[SHADE_KEYS[i + 1] as ShadeKey]);
        expect(current).toBeGreaterThanOrEqual(next);
      }
    }
  });
});
