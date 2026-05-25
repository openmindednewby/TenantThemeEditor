/**
 * Theme presets barrel export.
 * Provides built-in presets that tenants can choose as a starting point.
 */
import { DEFAULT_THEME_CONFIG } from './default';
import { FOREST_THEME_CONFIG } from './forest';
import { OCEAN_THEME_CONFIG } from './ocean';
import { SUNSET_THEME_CONFIG } from './sunset';
import { TAG_HEUER_THEME_CONFIG } from './tagHeuer';

import type { TenantThemeConfig } from '@/types';

export interface ThemePreset {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly config: TenantThemeConfig;
}

export const THEME_PRESETS: readonly ThemePreset[] = [
  { id: 'default', name: 'Default', description: 'Professional teal and gold', config: DEFAULT_THEME_CONFIG },
  { id: 'tagHeuer', name: 'Tag Heuer', description: 'Bold green and red accents', config: TAG_HEUER_THEME_CONFIG },
  { id: 'ocean', name: 'Ocean', description: 'Deep ocean blues with cyan', config: OCEAN_THEME_CONFIG },
  { id: 'forest', name: 'Forest', description: 'Nature-inspired greens', config: FOREST_THEME_CONFIG },
  { id: 'sunset', name: 'Sunset', description: 'Warm coral and amber', config: SUNSET_THEME_CONFIG },
];

export { DEFAULT_THEME_CONFIG } from './default';
export { TAG_HEUER_THEME_CONFIG } from './tagHeuer';
export { OCEAN_THEME_CONFIG } from './ocean';
export { FOREST_THEME_CONFIG } from './forest';
export { SUNSET_THEME_CONFIG } from './sunset';
