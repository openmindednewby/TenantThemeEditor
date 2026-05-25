/**
 * Displays a horizontal strip of shade swatches (50-900) for a color scale.
 */
import type { ColorScale } from '@/types';

const SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] as const;

interface ShadeScalePreviewProps {
  scale: ColorScale;
  label: string;
}

export const ShadeScalePreview = ({
  scale,
  label,
}: ShadeScalePreviewProps): JSX.Element => (
  <div className="space-y-1.5">
    <span className="text-xs font-medium text-text-secondary">{label}</span>
    <div className="flex overflow-hidden rounded-lg border border-border">
      {SHADES.map((shade) => (
        <div
          key={shade}
          aria-label={`${label} shade ${shade}`}
          className="group relative flex-1 transition-transform hover:z-10 hover:scale-110"
          style={{ backgroundColor: scale[shade] }}
        >
          <div className="h-8" />
          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold opacity-0 transition-opacity group-hover:opacity-100"
            style={{ color: Number(shade) >= 500 ? '#ffffff' : '#000000' }}
          >
            {shade}
          </span>
        </div>
      ))}
    </div>
  </div>
);
