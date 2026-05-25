/**
 * Preset Selector - Grid of theme preset cards with color swatches.
 */
import { useCallback } from 'react';

import { FM } from '@/localization';
import { THEME_PRESETS, type ThemePreset } from '@/presets';
import { useThemeEditorStore } from '@/stores/useThemeEditorStore';

import { SectionHeader } from '../shared/SectionHeader';

export const PresetSelector = (): JSX.Element => {
  const { config, applyPreset } = useThemeEditorStore();

  const handleApply = useCallback(
    (preset: ThemePreset) => {
      applyPreset(preset.config);
    },
    [applyPreset],
  );

  return (
    <section>
      <SectionHeader
        description={FM('editor.presets.description')}
        title={FM('editor.presets.title')}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {THEME_PRESETS.map((preset) => (
          <PresetCard
            key={preset.id}
            isActive={config.branding.presetId === preset.id}
            preset={preset}
            onApply={handleApply}
          />
        ))}
      </div>
    </section>
  );
};

// -- PresetCard ---------------------------------------------------------------

interface PresetCardProps {
  preset: ThemePreset;
  isActive: boolean;
  onApply: (preset: ThemePreset) => void;
}

const PresetCard = ({
  preset,
  isActive,
  onApply,
}: PresetCardProps): JSX.Element => {
  const handleClick = useCallback(() => onApply(preset), [onApply, preset]);

  const colors = [
    preset.config.primary,
    preset.config.secondary,
    preset.config.accent,
    preset.config.light.surface,
    preset.config.dark.background,
  ];

  const activeRing = isActive
    ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-surface'
    : '';

  return (
    <button
      aria-label={FM('editor.presets.applyPreset', preset.name)}
      aria-pressed={isActive}
      className={`flex w-full flex-col rounded-lg border border-border bg-surface p-3 transition-all hover:shadow-md hover:border-primary-300 ${activeRing}`}
      data-testid={`preset-card-${preset.id}`}
      type="button"
      onClick={handleClick}
    >
      <div className="mb-2 flex h-6 w-full overflow-hidden rounded">
        {colors.map((color, idx) => (
          <div
            key={`${color}-${String(idx)}`}
            className="flex-1"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-text-primary">
        {preset.name}
      </span>
      <span className="mt-0.5 text-xs text-text-secondary">
        {preset.description}
      </span>
      {isActive
        ? <span className="mt-1 text-xs text-primary-500">{FM('editor.presets.active')}</span>
        : null}
    </button>
  );
};
