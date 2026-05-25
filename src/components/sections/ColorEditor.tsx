/**
 * Color Editor - Color pickers for primary/secondary/accent with live shade scale preview.
 */
import { useCallback } from 'react';

import { FM } from '@/localization';
import { useThemeEditorStore } from '@/stores/useThemeEditorStore';

import { ColorPickerInput } from '../shared/ColorPickerInput';
import { SectionHeader } from '../shared/SectionHeader';
import { ShadeScalePreview } from '../shared/ShadeScalePreview';

export const ColorEditor = (): JSX.Element => {
  const {
    config,
    primaryScale,
    secondaryScale,
    accentScale,
    setPrimaryColor,
    setSecondaryColor,
    setAccentColor,
    setSemanticColor,
  } = useThemeEditorStore();

  const handleSuccess = useCallback(
    (hex: string) => setSemanticColor('success', hex),
    [setSemanticColor],
  );
  const handleWarning = useCallback(
    (hex: string) => setSemanticColor('warning', hex),
    [setSemanticColor],
  );
  const handleError = useCallback(
    (hex: string) => setSemanticColor('error', hex),
    [setSemanticColor],
  );
  const handleInfo = useCallback(
    (hex: string) => setSemanticColor('info', hex),
    [setSemanticColor],
  );

  return (
    <section className="space-y-6">
      <SectionHeader
        description={FM('editor.colors.description')}
        title={FM('editor.colors.title')}
      />

      {/* Brand colors */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ColorPickerInput
            label={FM('editor.colors.primary')}
            testId="color-primary"
            value={config.primary}
            onChange={setPrimaryColor}
          />
          <ColorPickerInput
            label={FM('editor.colors.secondary')}
            testId="color-secondary"
            value={config.secondary}
            onChange={setSecondaryColor}
          />
          <ColorPickerInput
            label={FM('editor.colors.accent')}
            testId="color-accent"
            value={config.accent}
            onChange={setAccentColor}
          />
        </div>

        {/* Shade scale previews */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            {FM('editor.colors.shadeScale')}
          </h4>
          <ShadeScalePreview
            label={FM('editor.colors.primary')}
            scale={primaryScale}
          />
          <ShadeScalePreview
            label={FM('editor.colors.secondary')}
            scale={secondaryScale}
          />
          <ShadeScalePreview
            label={FM('editor.colors.accent')}
            scale={accentScale}
          />
        </div>
      </div>

      {/* Semantic colors */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          {FM('editor.colors.semantic')}
        </h4>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <ColorPickerInput
            label={FM('editor.colors.success')}
            testId="color-success"
            value={config.semantic?.success ?? '#0a9396'}
            onChange={handleSuccess}
          />
          <ColorPickerInput
            label={FM('editor.colors.warning')}
            testId="color-warning"
            value={config.semantic?.warning ?? '#ee9b00'}
            onChange={handleWarning}
          />
          <ColorPickerInput
            label={FM('editor.colors.error')}
            testId="color-error"
            value={config.semantic?.error ?? '#ae2012'}
            onChange={handleError}
          />
          <ColorPickerInput
            label={FM('editor.colors.info')}
            testId="color-info"
            value={config.semantic?.info ?? '#005f73'}
            onChange={handleInfo}
          />
        </div>
      </div>
    </section>
  );
};
