/**
 * CSS Parser
 * Extracts CSS custom properties (variables) and converts them to color objects
 */

const { parseColor, isValidColor } = require('../utils/color-converter');

/**
 * Removes CSS comments from content
 * @param {string} css - CSS content
 * @returns {string} - CSS without comments
 */
function removeComments(css) {
  // Remove /* ... */ style comments
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * Parses CSS content and extracts custom properties that are valid colors
 * @param {string} cssContent - Raw CSS file content
 * @returns {Array<{name: string, color: string}>} - Array of color objects
 */
function parseCSS(cssContent) {
  if (!cssContent || typeof cssContent !== 'string') {
    return [];
  }

  const colors = [];

  // Remove comments first
  const cleanedCSS = removeComments(cssContent);

  // Regex to match CSS custom properties: --variable-name: value;
  // Captures the variable name (without --) and the value
  const customPropertyRegex = /--([a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g;

  let match;
  while ((match = customPropertyRegex.exec(cleanedCSS)) !== null) {
    const variableName = match[1].trim();
    const rawValue = match[2].trim();

    // Try to parse the value as a color
    const normalizedColor = parseColor(rawValue);

    if (normalizedColor) {
      colors.push({
        name: variableName,
        color: normalizedColor
      });
    }
    // Skip non-color values silently (CSS variables can hold any value)
  }

  return colors;
}

/**
 * Checks if content appears to be CSS
 * @param {string} content - File content
 * @returns {boolean} - True if content looks like CSS
 */
function isCSS(content) {
  if (!content || typeof content !== 'string') return false;

  // Check for common CSS patterns
  const hasCustomProperties = /--[a-zA-Z0-9_-]+\s*:/.test(content);
  const hasCSSStructure = /[{};]/.test(content);

  return hasCustomProperties || hasCSSStructure;
}

module.exports = {
  parseCSS,
  isCSS
};
