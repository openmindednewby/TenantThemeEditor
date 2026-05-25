import { useThemeEditorStore } from './useThemeEditorStore';

import { DEFAULT_THEME_CONFIG } from '@/presets';
import { OCEAN_THEME_CONFIG } from '@/presets/ocean';

describe('useThemeEditorStore', () => {
  beforeEach(() => {
    // Reset store to initial state including previewMode
    useThemeEditorStore.setState({ previewMode: 'light' });
    useThemeEditorStore.getState().setConfig(DEFAULT_THEME_CONFIG);
  });

  describe('initial state', () => {
    it('starts with default theme config', () => {
      const { config } = useThemeEditorStore.getState();
      expect(config.primary).toBe(DEFAULT_THEME_CONFIG.primary);
    });

    it('starts with isDirty false', () => {
      const { isDirty } = useThemeEditorStore.getState();
      expect(isDirty).toBe(false);
    });

    it('starts with light preview mode', () => {
      const { previewMode } = useThemeEditorStore.getState();
      expect(previewMode).toBe('light');
    });

    it('generates initial primary color scale', () => {
      const { primaryScale } = useThemeEditorStore.getState();
      expect(primaryScale['500']).toBe(DEFAULT_THEME_CONFIG.primary);
    });
  });

  describe('setPrimaryColor', () => {
    it('updates primary color in config', () => {
      useThemeEditorStore.getState().setPrimaryColor('#ff0000');
      const { config } = useThemeEditorStore.getState();
      expect(config.primary).toBe('#ff0000');
    });

    it('regenerates primary scale', () => {
      useThemeEditorStore.getState().setPrimaryColor('#ff0000');
      const { primaryScale } = useThemeEditorStore.getState();
      expect(primaryScale['500']).toBe('#ff0000');
    });

    it('sets isDirty to true', () => {
      useThemeEditorStore.getState().setPrimaryColor('#ff0000');
      const { isDirty } = useThemeEditorStore.getState();
      expect(isDirty).toBe(true);
    });
  });

  describe('setSecondaryColor', () => {
    it('updates secondary color and regenerates scale', () => {
      useThemeEditorStore.getState().setSecondaryColor('#00ff00');
      const { config, secondaryScale } = useThemeEditorStore.getState();
      expect(config.secondary).toBe('#00ff00');
      expect(secondaryScale['500']).toBe('#00ff00');
    });
  });

  describe('setAccentColor', () => {
    it('updates accent color and regenerates scale', () => {
      useThemeEditorStore.getState().setAccentColor('#0000ff');
      const { config, accentScale } = useThemeEditorStore.getState();
      expect(config.accent).toBe('#0000ff');
      expect(accentScale['500']).toBe('#0000ff');
    });
  });

  describe('setSemanticColor', () => {
    it('updates a semantic color override', () => {
      useThemeEditorStore.getState().setSemanticColor('success', '#22c55e');
      const { config } = useThemeEditorStore.getState();
      expect(config.semantic?.success).toBe('#22c55e');
    });

    it('preserves other semantic colors', () => {
      useThemeEditorStore.getState().setSemanticColor('success', '#22c55e');
      const { config } = useThemeEditorStore.getState();
      expect(config.semantic?.warning).toBe(DEFAULT_THEME_CONFIG.semantic?.warning);
    });
  });

  describe('setModeColor', () => {
    it('updates a light mode color', () => {
      useThemeEditorStore.getState().setModeColor('light', 'background', '#f0f0f0');
      const { config } = useThemeEditorStore.getState();
      expect(config.light.background).toBe('#f0f0f0');
    });

    it('updates a dark mode color', () => {
      useThemeEditorStore.getState().setModeColor('dark', 'surface', '#1a1a1a');
      const { config } = useThemeEditorStore.getState();
      expect(config.dark.surface).toBe('#1a1a1a');
    });

    it('preserves other mode colors', () => {
      useThemeEditorStore.getState().setModeColor('light', 'background', '#f0f0f0');
      const { config } = useThemeEditorStore.getState();
      expect(config.light.surface).toBe(DEFAULT_THEME_CONFIG.light.surface);
    });
  });

  describe('typography', () => {
    it('sets font family', () => {
      useThemeEditorStore.getState().setFontFamily('Georgia');
      const { config } = useThemeEditorStore.getState();
      expect(config.typography?.fontFamily).toBe('Georgia');
    });

    it('sets heading scale', () => {
      useThemeEditorStore.getState().setHeadingScale(1.25);
      const { config } = useThemeEditorStore.getState();
      expect(config.typography?.headingScale).toBe(1.25);
    });
  });

  describe('branding', () => {
    it('sets logo content ID', () => {
      useThemeEditorStore.getState().setLogoContentId('abc-123');
      const { config } = useThemeEditorStore.getState();
      expect(config.branding.logoContentId).toBe('abc-123');
    });

    it('clears logo content ID', () => {
      useThemeEditorStore.getState().setLogoContentId('abc-123');
      useThemeEditorStore.getState().setLogoContentId(null);
      const { config } = useThemeEditorStore.getState();
      expect(config.branding.logoContentId).toBeNull();
    });

    it('sets favicon content ID', () => {
      useThemeEditorStore.getState().setFaviconContentId('def-456');
      const { config } = useThemeEditorStore.getState();
      expect(config.branding.faviconContentId).toBe('def-456');
    });
  });

  describe('togglePreviewMode', () => {
    it('toggles from light to dark', () => {
      useThemeEditorStore.getState().togglePreviewMode();
      const { previewMode } = useThemeEditorStore.getState();
      expect(previewMode).toBe('dark');
    });

    it('toggles back to light', () => {
      useThemeEditorStore.getState().togglePreviewMode();
      useThemeEditorStore.getState().togglePreviewMode();
      const { previewMode } = useThemeEditorStore.getState();
      expect(previewMode).toBe('light');
    });
  });

  describe('applyPreset', () => {
    it('applies a preset config', () => {
      useThemeEditorStore.getState().applyPreset(OCEAN_THEME_CONFIG);
      const { config } = useThemeEditorStore.getState();
      expect(config.primary).toBe(OCEAN_THEME_CONFIG.primary);
    });

    it('regenerates all scales', () => {
      useThemeEditorStore.getState().applyPreset(OCEAN_THEME_CONFIG);
      const { primaryScale } = useThemeEditorStore.getState();
      expect(primaryScale['500']).toBe(OCEAN_THEME_CONFIG.primary);
    });

    it('sets isDirty to true', () => {
      useThemeEditorStore.getState().applyPreset(OCEAN_THEME_CONFIG);
      const { isDirty } = useThemeEditorStore.getState();
      expect(isDirty).toBe(true);
    });
  });

  describe('markSaved', () => {
    it('clears the dirty flag', () => {
      useThemeEditorStore.getState().setPrimaryColor('#ff0000');
      expect(useThemeEditorStore.getState().isDirty).toBe(true);

      useThemeEditorStore.getState().markSaved();
      expect(useThemeEditorStore.getState().isDirty).toBe(false);
    });
  });
});
