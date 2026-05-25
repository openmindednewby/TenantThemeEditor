/**
 * Live Preview Panel - Real-time preview of buttons, forms, cards, sidebar, text hierarchy.
 */
import { useCallback } from 'react';

import { FM } from '@/localization';
import { useThemeEditorStore } from '@/stores/useThemeEditorStore';
import { generateColorScale } from '@/utils/palette-generator';

import { SectionHeader } from '../shared/SectionHeader';

export const LivePreview = (): JSX.Element => {
  const { config, previewMode, togglePreviewMode } = useThemeEditorStore();
  const modeColors = previewMode === 'light' ? config.light : config.dark;
  const primary = generateColorScale(config.primary);
  const fontFamily = config.typography?.fontFamily ?? 'Inter';
  const headingScale = config.typography?.headingScale ?? 1.0;

  const handleToggle = useCallback(() => togglePreviewMode(), [togglePreviewMode]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionHeader
          description=""
          title={FM('editor.preview.title')}
        />
        <button
          aria-label="Toggle preview mode"
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-surface-elevated"
          data-testid="preview-mode-toggle"
          type="button"
          onClick={handleToggle}
        >
          {previewMode === 'light' ? FM('editor.mode.dark') : FM('editor.mode.light')}
        </button>
      </div>

      <div
        className="overflow-hidden rounded-xl border border-border"
        style={{
          backgroundColor: modeColors.background,
          color: modeColors.text,
          fontFamily: `'${fontFamily}', system-ui, sans-serif`,
        }}
      >
        <div className="flex">
          {/* Sidebar preview */}
          <PreviewSidebar
            modeColors={modeColors}
            primaryColor={primary['700']}
            primaryLight={primary['50']}
          />

          {/* Main content */}
          <div className="flex-1 p-6">
            {/* Heading hierarchy */}
            <div className="mb-6 space-y-1">
              <h1 style={{ fontSize: `${1.5 * headingScale}rem`, fontWeight: 700 }}>
                {FM('editor.preview.heading1')}
              </h1>
              <h2 style={{ fontSize: `${1.25 * headingScale}rem`, fontWeight: 600 }}>
                {FM('editor.preview.heading2')}
              </h2>
              <h3 style={{ fontSize: `${1.1 * headingScale}rem`, fontWeight: 600, color: modeColors.textSecondary }}>
                {FM('editor.preview.heading3')}
              </h3>
            </div>

            {/* Buttons row */}
            <div className="mb-6 flex flex-wrap gap-3">
              <button
                className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: primary['500'] }}
                type="button"
              >
                {FM('editor.preview.primaryButton')}
              </button>
              <button
                className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: config.secondary,
                  color: modeColors.text,
                }}
                type="button"
              >
                {FM('editor.preview.secondaryButton')}
              </button>
              <button
                className="rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  borderColor: primary['500'],
                  color: primary['500'],
                  backgroundColor: 'transparent',
                }}
                type="button"
              >
                {FM('editor.preview.outlineButton')}
              </button>
            </div>

            {/* Card preview */}
            <div
              className="mb-6 rounded-lg p-4"
              style={{
                backgroundColor: modeColors.surface,
                border: `1px solid ${modeColors.border}`,
              }}
            >
              <h4 className="mb-2 text-sm font-semibold">
                {FM('editor.preview.card')}
              </h4>
              <p className="text-sm" style={{ color: modeColors.textSecondary }}>
                {FM('editor.preview.cardBody')}
              </p>
            </div>

            {/* Form preview */}
            <div className="space-y-2">
              <label className="text-xs font-medium" style={{ color: modeColors.text }}>
                {FM('editor.preview.formLabel')}
              </label>
              <input
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
                placeholder={FM('editor.preview.formPlaceholder')}
                readOnly
                style={{
                  backgroundColor: modeColors.surfaceElevated,
                  borderColor: modeColors.border,
                  color: modeColors.text,
                }}
                type="text"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// -- PreviewSidebar -----------------------------------------------------------

interface PreviewSidebarProps {
  modeColors: { surface: string; text: string; textSecondary: string; border: string };
  primaryColor: string;
  primaryLight: string;
}

const SIDEBAR_ITEMS = [
  'editor.preview.dashboard',
  'editor.preview.settings',
  'editor.preview.users',
  'editor.preview.reports',
] as const;

const ACTIVE_INDEX = 0;

const PreviewSidebar = ({
  modeColors,
  primaryColor,
  primaryLight,
}: PreviewSidebarProps): JSX.Element => (
  <div
    className="w-40 space-y-1 border-r p-3"
    style={{
      backgroundColor: modeColors.surface,
      borderColor: modeColors.border,
    }}
  >
    <h4
      className="mb-3 text-xs font-bold uppercase tracking-wider"
      style={{ color: modeColors.textSecondary }}
    >
      {FM('editor.preview.sidebar')}
    </h4>
    {SIDEBAR_ITEMS.map((item, idx) => {
      const isActive = idx === ACTIVE_INDEX;
      return (
        <div
          key={item}
          className="rounded-md px-3 py-1.5 text-sm"
          style={{
            backgroundColor: isActive ? primaryLight : 'transparent',
            color: isActive ? primaryColor : modeColors.text,
            fontWeight: isActive ? 600 : 400,
          }}
        >
          {FM(item)}
        </div>
      );
    })}
  </div>
);
