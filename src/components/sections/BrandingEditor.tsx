/**
 * Branding Editor - Logo and favicon upload with drag-and-drop.
 */
import { useCallback, useRef, type DragEvent, type ChangeEvent } from 'react';

import { FM } from '@/localization';
import { useThemeEditorStore } from '@/stores/useThemeEditorStore';
import { useUploadFile } from '@/api/contentApi';

import { SectionHeader } from '../shared/SectionHeader';

export const BrandingEditor = (): JSX.Element => {
  const { config, setLogoContentId, setFaviconContentId } =
    useThemeEditorStore();
  const uploadMutation = useUploadFile();

  const handleLogoUpload = useCallback(
    async (file: File) => {
      const result = await uploadMutation.mutateAsync(file);
      setLogoContentId(result.contentId);
    },
    [uploadMutation, setLogoContentId],
  );

  const handleFaviconUpload = useCallback(
    async (file: File) => {
      const result = await uploadMutation.mutateAsync(file);
      setFaviconContentId(result.contentId);
    },
    [uploadMutation, setFaviconContentId],
  );

  const handleRemoveLogo = useCallback(
    () => setLogoContentId(null),
    [setLogoContentId],
  );

  const handleRemoveFavicon = useCallback(
    () => setFaviconContentId(null),
    [setFaviconContentId],
  );

  return (
    <section className="space-y-6">
      <SectionHeader
        description={FM('editor.branding.description')}
        title={FM('editor.branding.title')}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FileDropZone
          currentId={config.branding.logoContentId}
          label={FM('editor.branding.logo')}
          removeLabel={FM('editor.branding.removeLogo')}
          testId="branding-logo"
          onRemove={handleRemoveLogo}
          onUpload={handleLogoUpload}
        />
        <FileDropZone
          currentId={config.branding.faviconContentId}
          label={FM('editor.branding.favicon')}
          removeLabel={FM('editor.branding.removeFavicon')}
          testId="branding-favicon"
          onRemove={handleRemoveFavicon}
          onUpload={handleFaviconUpload}
        />
      </div>
    </section>
  );
};

// -- FileDropZone -------------------------------------------------------------

interface FileDropZoneProps {
  label: string;
  removeLabel: string;
  testId: string;
  currentId: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

const FileDropZone = ({
  label,
  removeLabel,
  testId,
  currentId,
  onUpload,
  onRemove,
}: FileDropZoneProps): JSX.Element => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) onUpload(file);
    },
    [onUpload],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onUpload(file);
    },
    [onUpload],
  );

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-text-primary">{label}</label>
      <div
        aria-label={`Drop zone for ${label}`}
        className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface p-4 transition-colors hover:border-primary-400 hover:bg-surface-elevated"
        data-testid={testId}
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onKeyDown={(e) => { if (e.key === 'Enter') handleClick(); }}
      >
        {currentId
          ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </div>
              <span className="font-mono text-xs text-text-secondary">
                {currentId.slice(0, 8)}...
              </span>
            </div>
          )
          : (
            <div className="flex flex-col items-center gap-2 text-text-secondary">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
              <span className="text-xs">{FM('editor.branding.dragDrop')}</span>
            </div>
          )}
        <input
          ref={inputRef}
          accept="image/*"
          className="hidden"
          type="file"
          onChange={handleFileChange}
        />
      </div>
      {currentId
        ? (
          <button
            aria-label={removeLabel}
            className="text-xs text-red-500 hover:text-red-700"
            data-testid={`${testId}-remove`}
            type="button"
            onClick={onRemove}
          >
            {removeLabel}
          </button>
        )
        : null}
    </div>
  );
};
