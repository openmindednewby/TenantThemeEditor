/**
 * Theme editor store - Zustand
 *
 * Manages the currently-edited theme configuration and provides
 * actions for updating colors, mode tokens, typography, and branding.
 */
import { create } from 'zustand';

import type { TenantThemeConfig, ThemeModeColors } from '@/types';
import { DEFAULT_THEME_CONFIG } from '@/presets';
import { generateColorScale } from '@/utils/palette-generator';
import type { ColorScale } from '@/types';

// -- State types --------------------------------------------------------------

interface ThemeEditorState {
  /** The theme configuration being edited */
  config: TenantThemeConfig;
  /** Generated palette from the current config */
  primaryScale: ColorScale;
  secondaryScale: ColorScale;
  accentScale: ColorScale;
  /** Whether there are unsaved changes */
  isDirty: boolean;
  /** Current preview mode (light or dark) */
  previewMode: 'light' | 'dark';
}

interface ThemeEditorActions {
  /** Set the entire theme config (e.g., from API response or preset) */
  setConfig: (config: TenantThemeConfig) => void;
  /** Update a single brand color and regenerate its scale */
  setPrimaryColor: (hex: string) => void;
  setSecondaryColor: (hex: string) => void;
  setAccentColor: (hex: string) => void;
  /** Update semantic color overrides */
  setSemanticColor: (key: 'success' | 'warning' | 'error' | 'info', hex: string) => void;
  /** Update mode-specific color tokens */
  setModeColor: (mode: 'light' | 'dark', key: keyof ThemeModeColors, hex: string) => void;
  /** Update typography config */
  setFontFamily: (fontFamily: string) => void;
  setHeadingScale: (scale: number) => void;
  /** Update branding */
  setLogoContentId: (id: string | null) => void;
  setFaviconContentId: (id: string | null) => void;
  /** Toggle preview mode */
  togglePreviewMode: () => void;
  /** Mark as saved (clears dirty flag) */
  markSaved: () => void;
  /** Reset to a preset */
  applyPreset: (config: TenantThemeConfig) => void;
}

export type ThemeEditorStore = ThemeEditorState & ThemeEditorActions;

const initialConfig = DEFAULT_THEME_CONFIG;

export const useThemeEditorStore = create<ThemeEditorStore>((set) => ({
  config: initialConfig,
  primaryScale: generateColorScale(initialConfig.primary),
  secondaryScale: generateColorScale(initialConfig.secondary),
  accentScale: generateColorScale(initialConfig.accent),
  isDirty: false,
  previewMode: 'light',

  setConfig: (config) =>
    set({
      config,
      primaryScale: generateColorScale(config.primary),
      secondaryScale: generateColorScale(config.secondary),
      accentScale: generateColorScale(config.accent),
      isDirty: false,
    }),

  setPrimaryColor: (hex) =>
    set((state) => ({
      config: { ...state.config, primary: hex },
      primaryScale: generateColorScale(hex),
      isDirty: true,
    })),

  setSecondaryColor: (hex) =>
    set((state) => ({
      config: { ...state.config, secondary: hex },
      secondaryScale: generateColorScale(hex),
      isDirty: true,
    })),

  setAccentColor: (hex) =>
    set((state) => ({
      config: { ...state.config, accent: hex },
      accentScale: generateColorScale(hex),
      isDirty: true,
    })),

  setSemanticColor: (key, hex) =>
    set((state) => ({
      config: {
        ...state.config,
        semantic: { ...state.config.semantic, [key]: hex },
      },
      isDirty: true,
    })),

  setModeColor: (mode, key, hex) =>
    set((state) => ({
      config: {
        ...state.config,
        [mode]: { ...state.config[mode], [key]: hex },
      },
      isDirty: true,
    })),

  setFontFamily: (fontFamily) =>
    set((state) => ({
      config: {
        ...state.config,
        typography: { ...state.config.typography, fontFamily },
      },
      isDirty: true,
    })),

  setHeadingScale: (headingScale) =>
    set((state) => ({
      config: {
        ...state.config,
        typography: { ...state.config.typography, headingScale },
      },
      isDirty: true,
    })),

  setLogoContentId: (id) =>
    set((state) => ({
      config: {
        ...state.config,
        branding: { ...state.config.branding, logoContentId: id },
      },
      isDirty: true,
    })),

  setFaviconContentId: (id) =>
    set((state) => ({
      config: {
        ...state.config,
        branding: { ...state.config.branding, faviconContentId: id },
      },
      isDirty: true,
    })),

  togglePreviewMode: () =>
    set((state) => ({
      previewMode: state.previewMode === 'light' ? 'dark' : 'light',
    })),

  markSaved: () => set({ isDirty: false }),

  applyPreset: (config) =>
    set({
      config,
      primaryScale: generateColorScale(config.primary),
      secondaryScale: generateColorScale(config.secondary),
      accentScale: generateColorScale(config.accent),
      isDirty: true,
    }),
}));
