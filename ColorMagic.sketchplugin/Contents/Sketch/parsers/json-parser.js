/**
 * JSON Parser
 * Extracts colors from JSON files, supporting nested structures
 */

const { parseColor, isValidColor } = require('../utils/color-converter');

/**
 * Recursively extracts colors from a JSON object
 * @param {Object} obj - JSON object to traverse
 * @param {string} prefix - Current path prefix for naming
 * @param {Array} colors - Accumulated colors array
 * @returns {Array<{name: string, color: string}>} - Array of color objects
 */
function extractColors(obj, prefix = '', colors = []) {
  if (!obj || typeof obj !== 'object') {
    return colors;
  }

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const currentPath = prefix ? `${prefix}/${key}` : key;

    if (typeof value === 'string') {
      // Try to parse as a color
      const normalizedColor = parseColor(value);
      if (normalizedColor) {
        colors.push({
          name: currentPath,
          color: normalizedColor
        });
      }
      // Skip non-color strings silently
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively process nested objects
      extractColors(value, currentPath, colors);
    }
    // Arrays are skipped - we don't process color arrays
  }

  return colors;
}

/**
 * Parses JSON content and extracts color values
 * @param {string} jsonContent - Raw JSON file content
 * @returns {Array<{name: string, color: string}>} - Array of color objects
 */
function parseJSON(jsonContent) {
  if (!jsonContent || typeof jsonContent !== 'string') {
    return [];
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonContent);
  } catch (e) {
    // Invalid JSON
    return [];
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    // We expect a root object, not an array or primitive
    return [];
  }

  return extractColors(parsed);
}

/**
 * Checks if content appears to be valid JSON
 * @param {string} content - File content
 * @returns {boolean} - True if content is valid JSON
 */
function isJSON(content) {
  if (!content || typeof content !== 'string') return false;

  try {
    JSON.parse(content);
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = {
  parseJSON,
  isJSON
};
