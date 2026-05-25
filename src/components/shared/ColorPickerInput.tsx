/**
 * Color picker with hex input and native color input.
 * Combines a visual color swatch with a text input for precise hex entry.
 */
import { useCallback, useState, type ChangeEvent } from 'react';

import { isValidHex } from '@/utils/palette-generator';

interface ColorPickerInputProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  testId: string;
}

export const ColorPickerInput = ({
  label,
  value,
  onChange,
  testId,
}: ColorPickerInputProps): JSX.Element => {
  const [localHex, setLocalHex] = useState(value);

  const handleColorChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const hex = e.target.value;
      setLocalHex(hex);
      onChange(hex);
    },
    [onChange],
  );

  const handleTextChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setLocalHex(raw);
      if (isValidHex(raw)) onChange(raw);
    },
    [onChange],
  );

  const handleTextBlur = useCallback(() => {
    if (!isValidHex(localHex)) setLocalHex(value);
  }, [localHex, value]);

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <input
          aria-label={`Pick color for ${label}`}
          className="h-10 w-10 min-h-[40px] min-w-[40px] cursor-pointer rounded-lg border-2 border-border transition-all hover:border-primary-400"
          data-testid={`${testId}-swatch`}
          type="color"
          value={value}
          onChange={handleColorChange}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-text-primary">
          {label}
        </label>
        <input
          aria-label={`Hex value for ${label}`}
          className="w-24 rounded border border-border bg-surface px-2 py-1 font-mono text-xs text-text-primary uppercase focus:border-primary-400 focus:outline-none"
          data-testid={`${testId}-hex`}
          type="text"
          value={localHex}
          onBlur={handleTextBlur}
          onChange={handleTextChange}
        />
      </div>
    </div>
  );
};
