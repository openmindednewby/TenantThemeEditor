/**
 * Typography Editor - Font family selector and heading scale.
 */
import { useCallback, type ChangeEvent } from 'react';

import { FM } from '@/localization';
import { useThemeEditorStore } from '@/stores/useThemeEditorStore';

import { SectionHeader } from '../shared/SectionHeader';

const FONT_FAMILIES = [
  'Inter',
  'Fira Sans',
  'Source Sans 3',
  'system-ui',
  'Georgia',
  'Verdana',
] as const;

const HEADING_SCALE_MIN = 0.75;
const HEADING_SCALE_MAX = 1.5;
const HEADING_SCALE_STEP = 0.05;
const DEFAULT_HEADING_SCALE = 1.0;

const H1_BASE = 2.25;
const H2_BASE = 1.875;
const H3_BASE = 1.5;

export const TypographyEditor = (): JSX.Element => {
  const { config, setFontFamily, setHeadingScale } = useThemeEditorStore();
  const currentFont = config.typography?.fontFamily ?? 'Inter';
  const currentScale = config.typography?.headingScale ?? DEFAULT_HEADING_SCALE;

  const handleFontChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => setFontFamily(e.target.value),
    [setFontFamily],
  );

  const handleScaleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) =>
      setHeadingScale(parseFloat(e.target.value)),
    [setHeadingScale],
  );

  return (
    <section className="space-y-6">
      <SectionHeader
        description={FM('editor.typography.description')}
        title={FM('editor.typography.title')}
      />

      <div className="space-y-4">
        {/* Font family selector */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-text-primary" htmlFor="font-family-select">
            {FM('editor.typography.fontFamily')}
          </label>
          <select
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-400 focus:outline-none"
            data-testid="typography-font-select"
            id="font-family-select"
            value={currentFont}
            onChange={handleFontChange}
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>

        {/* Heading scale slider */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-text-primary" htmlFor="heading-scale-slider">
            {FM('editor.typography.headingScale')}:{' '}
            <span className="font-mono text-primary-500">
              {currentScale.toFixed(2)}
            </span>
          </label>
          <input
            className="w-full accent-primary-500"
            data-testid="typography-heading-scale"
            id="heading-scale-slider"
            max={HEADING_SCALE_MAX}
            min={HEADING_SCALE_MIN}
            step={HEADING_SCALE_STEP}
            type="range"
            value={currentScale}
            onChange={handleScaleChange}
          />
        </div>

        {/* Typography preview */}
        <div className="rounded-lg border border-border bg-surface p-4">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-secondary">
            {FM('editor.typography.preview')}
          </h4>
          <div className="space-y-2" style={{ fontFamily: `'${currentFont}', system-ui, sans-serif` }}>
            <p style={{ fontSize: `${H1_BASE * currentScale}rem`, lineHeight: 1.2, fontWeight: 700 }}>
              {FM('editor.preview.heading1')}
            </p>
            <p style={{ fontSize: `${H2_BASE * currentScale}rem`, lineHeight: 1.3, fontWeight: 600 }}>
              {FM('editor.preview.heading2')}
            </p>
            <p style={{ fontSize: `${H3_BASE * currentScale}rem`, lineHeight: 1.4, fontWeight: 600 }}>
              {FM('editor.preview.heading3')}
            </p>
            <p className="text-sm text-text-secondary">
              {FM('editor.preview.bodyText')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
