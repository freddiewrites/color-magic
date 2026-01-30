/**
 * Color Converter Utility
 * Normalizes various color formats to Sketch's 8-character hex format (#rrggbbaa)
 */

/**
 * Converts a single hex digit to two digits
 * @param {string} hex - Single hex character
 * @returns {string} - Doubled hex character
 */
function expandHexDigit(hex) {
  return hex + hex;
}

/**
 * Converts a number (0-255) to a 2-character hex string
 * @param {number} num - Number to convert
 * @returns {string} - 2-character hex string
 */
function toHex(num) {
  const hex = Math.round(num).toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

/**
 * Normalizes any hex color format to #rrggbbaa
 * Supports: #rgb, #rgba, #rrggbb, #rrggbbaa
 * @param {string} hex - Hex color string
 * @returns {string|null} - Normalized hex or null if invalid
 */
function normalizeHex(hex) {
  if (!hex || typeof hex !== 'string') return null;

  // Remove # if present and trim whitespace
  let color = hex.trim();
  if (color.startsWith('#')) {
    color = color.substring(1);
  }

  // Validate hex characters
  if (!/^[0-9a-fA-F]+$/.test(color)) {
    return null;
  }

  let r, g, b, a;

  switch (color.length) {
    case 3: // #rgb
      r = expandHexDigit(color[0]);
      g = expandHexDigit(color[1]);
      b = expandHexDigit(color[2]);
      a = 'ff';
      break;
    case 4: // #rgba
      r = expandHexDigit(color[0]);
      g = expandHexDigit(color[1]);
      b = expandHexDigit(color[2]);
      a = expandHexDigit(color[3]);
      break;
    case 6: // #rrggbb
      r = color.substring(0, 2);
      g = color.substring(2, 4);
      b = color.substring(4, 6);
      a = 'ff';
      break;
    case 8: // #rrggbbaa
      r = color.substring(0, 2);
      g = color.substring(2, 4);
      b = color.substring(4, 6);
      a = color.substring(6, 8);
      break;
    default:
      return null;
  }

  return '#' + r.toLowerCase() + g.toLowerCase() + b.toLowerCase() + a.toLowerCase();
}

/**
 * Parses and converts rgba/rgb color to #rrggbbaa format
 * Supports: rgb(r, g, b), rgba(r, g, b, a)
 * @param {string} rgba - RGB(A) color string
 * @returns {string|null} - Hex color or null if invalid
 */
function rgbaToHex(rgba) {
  if (!rgba || typeof rgba !== 'string') return null;

  const trimmed = rgba.trim().toLowerCase();

  // Match rgb(r, g, b) or rgba(r, g, b, a)
  // Handles spaces around values and commas, and decimal values
  const match = trimmed.match(/^rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*(?:,\s*([\d.]+))?\s*\)$/);

  if (!match) return null;

  const r = Math.min(255, Math.max(0, parseFloat(match[1])));
  const g = Math.min(255, Math.max(0, parseFloat(match[2])));
  const b = Math.min(255, Math.max(0, parseFloat(match[3])));

  // Alpha defaults to 1 if not specified (rgb vs rgba)
  let a = 1;
  if (match[4] !== undefined) {
    a = parseFloat(match[4]);
    // Handle both 0-1 and 0-100 formats (assume 0-1 if <= 1, otherwise 0-100)
    if (a > 1) {
      a = a / 100;
    }
    a = Math.min(1, Math.max(0, a));
  }

  // Convert alpha from 0-1 to 0-255
  const alphaHex = toHex(Math.round(a * 255));

  return '#' + toHex(r) + toHex(g) + toHex(b) + alphaHex;
}

/**
 * Attempts to parse any color format and return normalized hex
 * @param {string} colorValue - Color string in any supported format
 * @returns {string|null} - Normalized #rrggbbaa hex or null if invalid
 */
function parseColor(colorValue) {
  if (!colorValue || typeof colorValue !== 'string') return null;

  const trimmed = colorValue.trim().toLowerCase();

  // Try hex formats first
  if (trimmed.startsWith('#') || /^[0-9a-f]{3,8}$/i.test(trimmed)) {
    const hex = normalizeHex(trimmed);
    if (hex) return hex;
  }

  // Try rgb/rgba format
  if (trimmed.startsWith('rgb')) {
    const hex = rgbaToHex(trimmed);
    if (hex) return hex;
  }

  return null;
}

/**
 * Checks if a string is a valid color value
 * @param {string} value - String to check
 * @returns {boolean} - True if valid color
 */
function isValidColor(value) {
  return parseColor(value) !== null;
}

module.exports = {
  normalizeHex,
  rgbaToHex,
  parseColor,
  isValidColor
};
