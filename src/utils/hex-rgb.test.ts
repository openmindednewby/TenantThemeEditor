import { hexToRgbString, rgbStringToHex } from './hex-rgb';

describe('hexToRgbString', () => {
  it('converts #000000 to "0 0 0"', () => {
    expect(hexToRgbString('#000000')).toBe('0 0 0');
  });

  it('converts #ffffff to "255 255 255"', () => {
    expect(hexToRgbString('#ffffff')).toBe('255 255 255');
  });

  it('converts #ff0000 to "255 0 0"', () => {
    expect(hexToRgbString('#ff0000')).toBe('255 0 0');
  });

  it('converts #005f73 to correct values', () => {
    expect(hexToRgbString('#005f73')).toBe('0 95 115');
  });

  it('handles uppercase hex', () => {
    expect(hexToRgbString('#AABBCC')).toBe('170 187 204');
  });

  it('returns "0 0 0" for invalid input', () => {
    expect(hexToRgbString('invalid')).toBe('0 0 0');
  });
});

describe('rgbStringToHex', () => {
  it('converts "0 0 0" to #000000', () => {
    expect(rgbStringToHex('0 0 0')).toBe('#000000');
  });

  it('converts "255 255 255" to #ffffff', () => {
    expect(rgbStringToHex('255 255 255')).toBe('#ffffff');
  });

  it('converts "255 0 0" to #ff0000', () => {
    expect(rgbStringToHex('255 0 0')).toBe('#ff0000');
  });

  it('returns #000000 for invalid input', () => {
    expect(rgbStringToHex('invalid')).toBe('#000000');
  });
});

describe('round-trip', () => {
  const testColors = ['#005f73', '#94d2bd', '#ee9b00', '#ae2012', '#ffffff', '#000000'];

  it.each(testColors)('round-trips %s correctly', (hex) => {
    const rgb = hexToRgbString(hex);
    const result = rgbStringToHex(rgb);
    expect(result).toBe(hex);
  });
});
