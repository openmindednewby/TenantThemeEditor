/**
 * Editor Layout - Main layout with sidebar editor and live preview.
 */
import { useCallback, useEffect } from 'react';

import { FM } from '@/localization';
import { useThemeEditorStore } from '@/stores/useThemeEditorStore';
import { injectThemeVariables } from '@/utils/theme-injector';

import { BrandingEditor } from './sections/BrandingEditor';
import { ColorEditor } from './sections/ColorEditor';
import { LivePreview } from './sections/LivePreview';
import { ModeEditor } from './sections/ModeEditor';
import { PresetSelector } from './sections/PresetSelector';
import { TypographyEditor } from './sections/TypographyEditor';

export const EditorLayout = (): JSX.Element => {
  const { config, previewMode, isDirty, markSaved } = useThemeEditorStore();

  // Inject CSS variables whenever config or preview mode changes
  useEffect(() => {
    injectThemeVariables(config, previewMode);
  }, [config, previewMode]);

  const handleSave = useCallback(() => {
    // In a real app, this would call useSaveTenantTheme
    markSaved();
  }, [markSaved]);

  const handleReset = useCallback(() => {
    useThemeEditorStore.getState().setConfig(config);
  }, [config]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div>
            <h1 className="text-lg font-bold text-text-primary">
              {FM('app.title')}
            </h1>
            <p className="text-xs text-text-secondary">
              {FM('app.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              aria-label={FM('editor.actions.reset')}
              className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-elevated"
              data-testid="action-reset"
              type="button"
              onClick={handleReset}
            >
              {FM('editor.actions.reset')}
            </button>
            <button
              aria-label={FM('editor.actions.save')}
              className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
              data-testid="action-save"
              disabled={!isDirty}
              type="button"
              onClick={handleSave}
            >
              {FM('editor.actions.save')}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr,400px]">
          {/* Editor panels */}
          <div className="space-y-10">
            <PresetSelector />
            <ColorEditor />
            <ModeEditor />
            <TypographyEditor />
            <BrandingEditor />
          </div>

          {/* Live preview - sticky on large screens */}
          <div className="xl:sticky xl:top-20 xl:self-start">
            <LivePreview />
          </div>
        </div>
      </main>
    </div>
  );
};
