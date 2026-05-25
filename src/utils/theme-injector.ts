/**
 * Theme CSS variable injector.
 * Takes a TenantThemeConfig and injects CSS custom properties
 * on the :root element so Tailwind classes resolve correctly.
 */
import type { TenantThemeConfig, ColorScale } from '@/types';
import { generateColorScale } from './palette-generator';
import { hexToRgbString } from './hex-rgb';

/** Inject all CSS variables from a theme config onto :root. */
export function injectThemeVariables(
  config: TenantThemeConfig,
  mode: 'light' | 'dark',
): void {
  const root = document.documentElement;
  const modeColors = mode === 'light' ? config.light : config.dark;

  // Primary palette
  const primaryScale = generateColorScale(config.primary);
  injectColorScale(root, 'primary', primaryScale);

  // Secondary & accent (just 500 for now)
  const secondaryScale = generateColorScale(config.secondary);
  root.style.setProperty('--color-secondary-500', hexToRgbString(secondaryScale['500']));

  const accentScale = generateColorScale(config.accent);
  root.style.setProperty('--color-accent-500', hexToRgbString(accentScale['500']));

  // Mode-specific tokens
  root.style.setProperty('--color-background', hexToRgbString(modeColors.background));
  root.style.setProperty('--color-surface', hexToRgbString(modeColors.surface));
  root.style.setProperty('--color-surface-elevated', hexToRgbString(modeColors.surfaceElevated));
  root.style.setProperty('--color-border', hexToRgbString(modeColors.border));
  root.style.setProperty('--color-text-primary', hexToRgbString(modeColors.text));
  root.style.setProperty('--color-text-secondary', hexToRgbString(modeColors.textSecondary));
  root.style.setProperty('--color-text-muted', hexToRgbString(modeColors.textSecondary));

  // Typography
  if (config.typography?.fontFamily)
    root.style.setProperty('--font-sans', `'${config.typography.fontFamily}', ui-sans-serif, system-ui, sans-serif`);
}

/** Inject a full color scale (50-900) as CSS variables. */
function injectColorScale(
  root: HTMLElement,
  prefix: string,
  scale: ColorScale,
): void {
  const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] as const;
  for (const shade of shades)
    root.style.setProperty(`--color-${prefix}-${shade}`, hexToRgbString(scale[shade]));
}
