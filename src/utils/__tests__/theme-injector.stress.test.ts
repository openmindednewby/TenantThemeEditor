/**
 * Stress tests for theme-injector utilities.
 *
 * Verifies DOM consistency under rapid injection, missing/null fields,
 * and variable cleanup scenarios.
 */
import { injectThemeVariables } from '../theme-injector';

import { DEFAULT_THEME_CONFIG } from '@/presets';
import type { TenantThemeConfig, ThemeModeColors } from '@/types';

// -- Helpers ------------------------------------------------------------------

const RAPID_INJECT_COUNT = 100;

/** Generate a deterministic hex color from a seed index. */
function seedToHex(seed: number): string {
  const r = (seed * 37 + 13) % 256;
  const g = (seed * 53 + 29) % 256;
  const b = (seed * 97 + 41) % 256;
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/** Build a theme config where brand colors are derived from a seed. */
function buildThemeFromSeed(seed: number): TenantThemeConfig {
  return {
    ...DEFAULT_THEME_CONFIG,
    primary: seedToHex(seed),
    secondary: seedToHex(seed + 1000),
    accent: seedToHex(seed + 2000),
  };
}

/** Get a CSS variable value from the root element. */
function getCssVar(name: string): string {
  return document.documentElement.style.getPropertyValue(name);
}

/** Get all CSS variable names currently set on :root. */
function getAllCssVarNames(): string[] {
  const style = document.documentElement.style;
  const names: string[] = [];
  for (let i = 0; i < style.length; i++) {
    const prop = style.item(i);
    if (prop.startsWith('--'))
      names.push(prop);
  }
  return names;
}

/** Remove all CSS variables from :root. */
function clearAllCssVars(): void {
  const names = getAllCssVarNames();
  for (const name of names)
    document.documentElement.style.removeProperty(name);
}

// -- Setup / Teardown ---------------------------------------------------------

beforeEach(() => {
  clearAllCssVars();
});

afterEach(() => {
  clearAllCssVars();
});

// -- 1. Inject 100 different themes rapidly -----------------------------------

describe('rapid theme injection', () => {
  it('DOM has consistent CSS variables after 100 rapid injections', () => {
    const lastTheme = buildThemeFromSeed(RAPID_INJECT_COUNT - 1);

    for (let i = 0; i < RAPID_INJECT_COUNT; i++)
      injectThemeVariables(buildThemeFromSeed(i), 'light');

    // The root should have the variables from the last injection
    const primaryVar = getCssVar('--color-primary-500');
    expect(primaryVar).not.toBe('');

    // Background should match light mode of the last theme
    const bgVar = getCssVar('--color-background');
    expect(bgVar).not.toBe('');

    // Verify it is deterministic - injecting the same last theme again
    // should produce the same result
    injectThemeVariables(lastTheme, 'light');
    const primaryVarAfter = getCssVar('--color-primary-500');
    expect(primaryVarAfter).toBe(primaryVar);
  });

  it('alternating between light and dark mode on each injection', () => {
    for (let i = 0; i < RAPID_INJECT_COUNT; i++) {
      const mode = i % 2 === 0 ? 'light' : 'dark';
      injectThemeVariables(DEFAULT_THEME_CONFIG, mode as 'light' | 'dark');
    }

    // Last iteration (i=99) is odd => dark mode
    const bgVar = getCssVar('--color-background');
    expect(bgVar).not.toBe('');
  });

  it('no CSS variable names are duplicated', () => {
    injectThemeVariables(DEFAULT_THEME_CONFIG, 'light');

    const names = getAllCssVarNames();
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });
});

// -- 2. Inject theme with missing/null fields ---------------------------------

describe('missing or null fields', () => {
  it('handles config with null branding IDs without crashing', () => {
    const config: TenantThemeConfig = {
      ...DEFAULT_THEME_CONFIG,
      branding: {
        logoContentId: null,
        faviconContentId: null,
        presetId: null,
      },
    };

    expect(() => injectThemeVariables(config, 'light')).not.toThrow();
  });

  it('handles config without typography without crashing', () => {
    const config: TenantThemeConfig = {
      ...DEFAULT_THEME_CONFIG,
      typography: undefined,
    };

    expect(() => injectThemeVariables(config, 'light')).not.toThrow();
    // Font variable should not be set when typography is missing
    expect(getCssVar('--font-sans')).toBe('');
  });

  it('handles config with empty fontFamily without crashing', () => {
    const config: TenantThemeConfig = {
      ...DEFAULT_THEME_CONFIG,
      typography: { fontFamily: '' },
    };

    expect(() => injectThemeVariables(config, 'light')).not.toThrow();
    // Empty fontFamily is falsy, so variable should not be set
    expect(getCssVar('--font-sans')).toBe('');
  });

  it('handles config without semantic overrides', () => {
    const config: TenantThemeConfig = {
      ...DEFAULT_THEME_CONFIG,
      semantic: undefined,
    };

    // The injector only uses primary/secondary/accent/mode colors,
    // not semantic colors directly, so this should work fine
    expect(() => injectThemeVariables(config, 'light')).not.toThrow();
    expect(getCssVar('--color-primary-500')).not.toBe('');
  });

  it('injects both light and dark mode correctly', () => {
    injectThemeVariables(DEFAULT_THEME_CONFIG, 'light');
    const lightBg = getCssVar('--color-background');

    injectThemeVariables(DEFAULT_THEME_CONFIG, 'dark');
    const darkBg = getCssVar('--color-background');

    // Light and dark backgrounds should be different for the default config
    expect(lightBg).not.toBe(darkBg);
  });
});

// -- 3. Inject theme then remove all variables --------------------------------

describe('variable cleanup', () => {
  it('clearing all CSS variables after injection leaves no theme variables', () => {
    injectThemeVariables(DEFAULT_THEME_CONFIG, 'light');
    const varsBefore = getAllCssVarNames();
    expect(varsBefore.length).toBeGreaterThan(0);

    clearAllCssVars();
    const varsAfter = getAllCssVarNames();
    expect(varsAfter.length).toBe(0);
  });

  it('re-injection after cleanup restores all variables', () => {
    injectThemeVariables(DEFAULT_THEME_CONFIG, 'light');
    const varsFirst = getAllCssVarNames().sort();

    clearAllCssVars();
    expect(getAllCssVarNames().length).toBe(0);

    injectThemeVariables(DEFAULT_THEME_CONFIG, 'light');
    const varsSecond = getAllCssVarNames().sort();

    expect(varsSecond).toEqual(varsFirst);
  });

  it('injecting a new theme overwrites previous theme variables', () => {
    injectThemeVariables(DEFAULT_THEME_CONFIG, 'light');
    const primary500Before = getCssVar('--color-primary-500');

    const altTheme = buildThemeFromSeed(42);
    injectThemeVariables(altTheme, 'light');
    const primary500After = getCssVar('--color-primary-500');

    // The primary colors are different, so the variable values should differ
    expect(primary500After).not.toBe(primary500Before);
  });

  it('typography variable is properly overwritten between themes', () => {
    const configWithFont: TenantThemeConfig = {
      ...DEFAULT_THEME_CONFIG,
      typography: { fontFamily: 'Georgia' },
    };

    injectThemeVariables(configWithFont, 'light');
    expect(getCssVar('--font-sans')).toContain('Georgia');

    const configWithDifferentFont: TenantThemeConfig = {
      ...DEFAULT_THEME_CONFIG,
      typography: { fontFamily: 'Helvetica' },
    };

    injectThemeVariables(configWithDifferentFont, 'light');
    expect(getCssVar('--font-sans')).toContain('Helvetica');
    expect(getCssVar('--font-sans')).not.toContain('Georgia');
  });
});
