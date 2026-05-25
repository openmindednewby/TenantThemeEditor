/**
 * Mode Editor - Light/dark toggle with per-mode color overrides.
 */
import { useCallback } from 'react';

import { FM } from '@/localization';
import { useThemeEditorStore } from '@/stores/useThemeEditorStore';
import type { ThemeModeColors } from '@/types';

import { ColorPickerInput } from '../shared/ColorPickerInput';
import { SectionHeader } from '../shared/SectionHeader';

const MODE_COLOR_KEYS: readonly (keyof ThemeModeColors)[] = [
  'background',
  'surface',
  'surfaceElevated',
  'text',
  'textSecondary',
  'border',
  'divider',
];

const LABEL_KEYS: Record<keyof ThemeModeColors, string> = {
  background: 'editor.mode.background',
  surface: 'editor.mode.surface',
  surfaceElevated: 'editor.mode.surfaceElevated',
  text: 'editor.mode.text',
  textSecondary: 'editor.mode.textSecondary',
  border: 'editor.mode.border',
  divider: 'editor.mode.divider',
};

export const ModeEditor = (): JSX.Element => {
  const { config, setModeColor } = useThemeEditorStore();

  return (
    <section className="space-y-6">
      <SectionHeader
        description={FM('editor.mode.description')}
        title={FM('editor.mode.title')}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ModePanel
          mode="light"
          modeColors={config.light}
          title={FM('editor.mode.light')}
          onColorChange={setModeColor}
        />
        <ModePanel
          mode="dark"
          modeColors={config.dark}
          title={FM('editor.mode.dark')}
          onColorChange={setModeColor}
        />
      </div>
    </section>
  );
};

// -- ModePanel ----------------------------------------------------------------

interface ModePanelProps {
  mode: 'light' | 'dark';
  title: string;
  modeColors: ThemeModeColors;
  onColorChange: (mode: 'light' | 'dark', key: keyof ThemeModeColors, hex: string) => void;
}

const ModePanel = ({
  mode,
  title,
  modeColors,
  onColorChange,
}: ModePanelProps): JSX.Element => {
  const bgColor = mode === 'dark' ? '#1e293b' : '#f8fafc';

  return (
    <div
      className="rounded-lg border border-border p-4"
      style={{ backgroundColor: bgColor }}
    >
      <h4
        className="mb-4 text-sm font-semibold"
        style={{ color: mode === 'dark' ? '#e2e8f0' : '#0f172a' }}
      >
        {title}
      </h4>
      <div className="space-y-3">
        {MODE_COLOR_KEYS.map((key) => (
          <ModeColorRow
            key={key}
            colorKey={key}
            mode={mode}
            value={modeColors[key]}
            onColorChange={onColorChange}
          />
        ))}
      </div>
    </div>
  );
};

// -- ModeColorRow -------------------------------------------------------------

interface ModeColorRowProps {
  mode: 'light' | 'dark';
  colorKey: keyof ThemeModeColors;
  value: string;
  onColorChange: (mode: 'light' | 'dark', key: keyof ThemeModeColors, hex: string) => void;
}

const ModeColorRow = ({
  mode,
  colorKey,
  value,
  onColorChange,
}: ModeColorRowProps): JSX.Element => {
  const handleChange = useCallback(
    (hex: string) => onColorChange(mode, colorKey, hex),
    [mode, colorKey, onColorChange],
  );

  return (
    <ColorPickerInput
      label={FM(LABEL_KEYS[colorKey])}
      testId={`mode-${mode}-${colorKey}`}
      value={value}
      onChange={handleChange}
    />
  );
};
