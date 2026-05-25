/**
 * Stress tests for the ThemeEditorStore.
 *
 * Verifies store consistency under rapid mutations, concurrent-like actions,
 * edge-case inputs, and dirty-tracking invariants.
 */
import { useThemeEditorStore } from '../useThemeEditorStore';

import {
  DEFAULT_THEME_CONFIG,
  OCEAN_THEME_CONFIG,
  FOREST_THEME_CONFIG,
  SUNSET_THEME_CONFIG,
  TAG_HEUER_THEME_CONFIG,
  THEME_PRESETS,
} from '@/presets';
import { generateColorScale } from '@/utils/palette-generator';
import type { TenantThemeConfig } from '@/types';

// -- Helpers ------------------------------------------------------------------

const RAPID_COLOR_ITERATIONS = 100;
const TOGGLE_ITERATIONS = 200;

/** Generate a deterministic hex color from an index. */
function indexToHex(i: number): string {
  const r = (i * 37) % 256;
  const g = (i * 53) % 256;
  const b = (i * 97) % 256;
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/** Get a fresh snapshot of the store state. */
function getState() {
  return useThemeEditorStore.getState();
}

// -- Setup --------------------------------------------------------------------

beforeEach(() => {
  useThemeEditorStore.setState({ previewMode: 'light' });
  getState().setConfig(DEFAULT_THEME_CONFIG);
});

// -- 1. Apply all 5 presets in rapid succession -------------------------------

describe('rapid preset application', () => {
  it('final state matches the last applied preset', () => {
    const presets: TenantThemeConfig[] = [
      DEFAULT_THEME_CONFIG,
      OCEAN_THEME_CONFIG,
      FOREST_THEME_CONFIG,
      SUNSET_THEME_CONFIG,
      TAG_HEUER_THEME_CONFIG,
    ];

    for (const preset of presets)
      getState().applyPreset(preset);

    const { config, primaryScale, secondaryScale, accentScale } = getState();

    expect(config).toEqual(TAG_HEUER_THEME_CONFIG);
    expect(primaryScale['500']).toBe(TAG_HEUER_THEME_CONFIG.primary);
    expect(secondaryScale['500']).toBe(TAG_HEUER_THEME_CONFIG.secondary);
    expect(accentScale['500']).toBe(TAG_HEUER_THEME_CONFIG.accent);
  });

  it('cycling through all presets multiple times produces correct final state', () => {
    const presetConfigs = THEME_PRESETS.map((p) => p.config);
    const cycleCount = 3;

    for (let cycle = 0; cycle < cycleCount; cycle++)
      for (const cfg of presetConfigs)
        getState().applyPreset(cfg);

    const lastPreset = presetConfigs[presetConfigs.length - 1]!;
    const { config } = getState();
    expect(config.primary).toBe(lastPreset.primary);
    expect(config.secondary).toBe(lastPreset.secondary);
    expect(config.accent).toBe(lastPreset.accent);
  });
});

// -- 2. Change primary color 100 times rapidly --------------------------------

describe('rapid primary color changes', () => {
  it('store reflects the last applied color after 100 rapid changes', () => {
    let lastHex = '';
    for (let i = 0; i < RAPID_COLOR_ITERATIONS; i++) {
      lastHex = indexToHex(i);
      getState().setPrimaryColor(lastHex);
    }

    const { config, primaryScale, isDirty } = getState();
    expect(config.primary).toBe(lastHex);
    expect(primaryScale['500']).toBe(lastHex);
    expect(isDirty).toBe(true);
  });

  it('secondary and accent scales remain unaffected', () => {
    const originalSecondary = getState().secondaryScale['500'];
    const originalAccent = getState().accentScale['500'];

    for (let i = 0; i < RAPID_COLOR_ITERATIONS; i++)
      getState().setPrimaryColor(indexToHex(i));

    expect(getState().secondaryScale['500']).toBe(originalSecondary);
    expect(getState().accentScale['500']).toBe(originalAccent);
  });

  it('primary scale is always consistent with config.primary', () => {
    for (let i = 0; i < RAPID_COLOR_ITERATIONS; i++) {
      const hex = indexToHex(i);
      getState().setPrimaryColor(hex);

      const { config, primaryScale } = getState();
      expect(config.primary).toBe(hex);
      expect(primaryScale['500']).toBe(hex);
    }
  });
});

// -- 3. Toggle preview mode 200 times -----------------------------------------

describe('rapid preview mode toggling', () => {
  it('200 toggles leave mode in correct final state', () => {
    for (let i = 0; i < TOGGLE_ITERATIONS; i++)
      getState().togglePreviewMode();

    // 200 is even, so it should end back at the starting mode
    expect(getState().previewMode).toBe('light');
  });

  it('201 toggles leave mode in dark', () => {
    const oddCount = 201;
    for (let i = 0; i < oddCount; i++)
      getState().togglePreviewMode();

    expect(getState().previewMode).toBe('dark');
  });

  it('toggling does not affect dirty flag or config', () => {
    const configBefore = { ...getState().config };
    const dirtyBefore = getState().isDirty;

    for (let i = 0; i < TOGGLE_ITERATIONS; i++)
      getState().togglePreviewMode();

    expect(getState().isDirty).toBe(dirtyBefore);
    expect(getState().config.primary).toBe(configBefore.primary);
  });
});

// -- 4. Set all possible fields to empty strings ------------------------------

describe('empty string field values', () => {
  it('handles empty primary/secondary/accent without crashing', () => {
    expect(() => {
      getState().setPrimaryColor('');
      getState().setSecondaryColor('');
      getState().setAccentColor('');
    }).not.toThrow();

    const { config } = getState();
    expect(config.primary).toBe('');
    expect(config.secondary).toBe('');
    expect(config.accent).toBe('');
  });

  it('handles empty semantic colors without crashing', () => {
    expect(() => {
      getState().setSemanticColor('success', '');
      getState().setSemanticColor('warning', '');
      getState().setSemanticColor('error', '');
      getState().setSemanticColor('info', '');
    }).not.toThrow();
  });

  it('handles empty mode colors without crashing', () => {
    const modeKeys = [
      'background',
      'surface',
      'surfaceElevated',
      'text',
      'textSecondary',
      'border',
      'divider',
    ] as const;

    expect(() => {
      for (const key of modeKeys) {
        getState().setModeColor('light', key, '');
        getState().setModeColor('dark', key, '');
      }
    }).not.toThrow();
  });

  it('handles empty font family', () => {
    expect(() => getState().setFontFamily('')).not.toThrow();
    expect(getState().config.typography?.fontFamily).toBe('');
  });

  it('handles empty branding IDs', () => {
    expect(() => {
      getState().setLogoContentId('');
      getState().setFaviconContentId('');
    }).not.toThrow();
    expect(getState().config.branding.logoContentId).toBe('');
    expect(getState().config.branding.faviconContentId).toBe('');
  });
});

// -- 5. Extremely long color strings -----------------------------------------

describe('extremely long / invalid color strings', () => {
  const longString = '#' + 'f'.repeat(1000);
  const nonsenseString = 'this-is-not-a-color-at-all-but-very-long-text';

  it('does not crash with a 1000-character hex-like string', () => {
    expect(() => getState().setPrimaryColor(longString)).not.toThrow();
    expect(getState().config.primary).toBe(longString);
  });

  it('does not crash with a nonsense string', () => {
    expect(() => getState().setPrimaryColor(nonsenseString)).not.toThrow();
    expect(getState().config.primary).toBe(nonsenseString);
  });

  it('does not crash with unicode input', () => {
    const unicodeColor = '#\u00e9\u00e8\u00ea\u00eb\u00ec\u00ed';
    expect(() => getState().setPrimaryColor(unicodeColor)).not.toThrow();
  });

  it('store remains functional after invalid input', () => {
    getState().setPrimaryColor(longString);
    getState().setPrimaryColor('#ff0000');

    expect(getState().config.primary).toBe('#ff0000');
    expect(getState().primaryScale['500']).toBe('#ff0000');
  });
});

// -- 6. Concurrent-like actions -----------------------------------------------

describe('concurrent-like actions', () => {
  it('change color + apply preset + toggle mode in rapid sequence', () => {
    getState().setPrimaryColor('#ff0000');
    getState().applyPreset(OCEAN_THEME_CONFIG);
    getState().togglePreviewMode();

    const { config, primaryScale, previewMode } = getState();
    expect(config.primary).toBe(OCEAN_THEME_CONFIG.primary);
    expect(primaryScale['500']).toBe(OCEAN_THEME_CONFIG.primary);
    expect(previewMode).toBe('dark');
  });

  it('interleaved color + mode + semantic changes', () => {
    for (let i = 0; i < 50; i++) {
      getState().setPrimaryColor(indexToHex(i));
      getState().togglePreviewMode();
      getState().setSemanticColor('success', indexToHex(i + 100));
      getState().setModeColor('light', 'background', indexToHex(i + 200));
    }

    const lastPrimary = indexToHex(49);
    const lastSemantic = indexToHex(149);
    const lastBackground = indexToHex(249);

    expect(getState().config.primary).toBe(lastPrimary);
    expect(getState().config.semantic?.success).toBe(lastSemantic);
    expect(getState().config.light.background).toBe(lastBackground);
    // 50 toggles from 'light' => even number => back to 'light'
    expect(getState().previewMode).toBe('light');
  });

  it('preset application mid-stream resets colors but preserves mode', () => {
    getState().togglePreviewMode(); // -> dark
    getState().setPrimaryColor('#aabbcc');
    getState().applyPreset(FOREST_THEME_CONFIG);

    expect(getState().config.primary).toBe(FOREST_THEME_CONFIG.primary);
    expect(getState().previewMode).toBe('dark');
  });
});

// -- 7. markSaved then make changes -------------------------------------------

describe('dirty tracking accuracy', () => {
  it('markSaved clears dirty, subsequent change re-sets it', () => {
    getState().setPrimaryColor('#112233');
    expect(getState().isDirty).toBe(true);

    getState().markSaved();
    expect(getState().isDirty).toBe(false);

    getState().setSecondaryColor('#445566');
    expect(getState().isDirty).toBe(true);
  });

  it('markSaved then markSaved again is idempotent', () => {
    getState().markSaved();
    getState().markSaved();
    expect(getState().isDirty).toBe(false);
  });

  it('setConfig clears dirty flag (loads from API/saved state)', () => {
    getState().setPrimaryColor('#ff0000');
    expect(getState().isDirty).toBe(true);

    getState().setConfig(OCEAN_THEME_CONFIG);
    expect(getState().isDirty).toBe(false);
  });

  it('applyPreset sets dirty flag (user intent to change)', () => {
    getState().setConfig(DEFAULT_THEME_CONFIG);
    expect(getState().isDirty).toBe(false);

    getState().applyPreset(OCEAN_THEME_CONFIG);
    expect(getState().isDirty).toBe(true);
  });

  it('every mutating action sets dirty to true', () => {
    const actions: Array<() => void> = [
      () => getState().setPrimaryColor('#aaa'),
      () => getState().setSecondaryColor('#bbb'),
      () => getState().setAccentColor('#ccc'),
      () => getState().setSemanticColor('success', '#ddd'),
      () => getState().setModeColor('light', 'background', '#eee'),
      () => getState().setFontFamily('Arial'),
      () => getState().setHeadingScale(1.5),
      () => getState().setLogoContentId('logo-1'),
      () => getState().setFaviconContentId('fav-1'),
      () => getState().applyPreset(FOREST_THEME_CONFIG),
    ];

    for (const action of actions) {
      getState().markSaved();
      expect(getState().isDirty).toBe(false);
      action();
      expect(getState().isDirty).toBe(true);
    }
  });

  it('togglePreviewMode does NOT set dirty flag', () => {
    getState().markSaved();
    getState().togglePreviewMode();
    expect(getState().isDirty).toBe(false);
  });
});

// -- 8. Apply preset, modify one color, verify no longer matching preset ------

describe('preset divergence detection', () => {
  it('after applying preset and modifying primary, config differs from preset', () => {
    getState().applyPreset(OCEAN_THEME_CONFIG);
    getState().setPrimaryColor('#999999');

    const { config } = getState();
    expect(config.primary).not.toBe(OCEAN_THEME_CONFIG.primary);
    expect(config.secondary).toBe(OCEAN_THEME_CONFIG.secondary);
    expect(config.accent).toBe(OCEAN_THEME_CONFIG.accent);
  });

  it('after applying preset and modifying semantic, config differs from preset', () => {
    getState().applyPreset(SUNSET_THEME_CONFIG);
    getState().setSemanticColor('error', '#000000');

    expect(getState().config.semantic?.error).toBe('#000000');
    expect(getState().config.semantic?.error).not.toBe(SUNSET_THEME_CONFIG.semantic?.error);
  });

  it('applying same preset twice results in identical config', () => {
    getState().applyPreset(FOREST_THEME_CONFIG);
    const firstConfig = { ...getState().config };

    getState().applyPreset(FOREST_THEME_CONFIG);
    const secondConfig = getState().config;

    expect(secondConfig).toEqual(firstConfig);
  });

  it('scales are regenerated correctly when modifying one color after preset', () => {
    getState().applyPreset(OCEAN_THEME_CONFIG);
    const expectedSecondaryScale = generateColorScale(OCEAN_THEME_CONFIG.secondary);

    getState().setPrimaryColor('#123456');
    const expectedPrimaryScale = generateColorScale('#123456');

    const { primaryScale, secondaryScale } = getState();
    expect(primaryScale).toEqual(expectedPrimaryScale);
    expect(secondaryScale).toEqual(expectedSecondaryScale);
  });
});
