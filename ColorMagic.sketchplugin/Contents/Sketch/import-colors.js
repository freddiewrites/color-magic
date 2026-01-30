/**
 * Color Magic - Main Command Handler
 * Imports color variables from CSS or JSON files into Sketch documents
 */

const sketch = require('sketch');
const { parseCSS, isCSS } = require('./parsers/css-parser');
const { parseJSON, isJSON } = require('./parsers/json-parser');

const UI = sketch.UI;

/**
 * Reads a file using native macOS APIs
 * @param {string} filePath - Path to the file
 * @returns {string|null} - File contents or null on error
 */
function readFile(filePath) {
  try {
    const error = MOPointer.alloc().init();
    const content = NSString.stringWithContentsOfFile_encoding_error(
      filePath,
      NSUTF8StringEncoding,
      error
    );
    if (error.value() !== null) {
      return null;
    }
    return content ? String(content) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Shows a native macOS file open dialog
 * @returns {string|null} - Selected file path or null if cancelled
 */
function showOpenDialog() {
  const panel = NSOpenPanel.openPanel();

  panel.setCanChooseFiles(true);
  panel.setCanChooseDirectories(false);
  panel.setAllowsMultipleSelection(false);
  panel.setTitle('Select Color File');
  panel.setPrompt('Import');

  // Allow CSS and JSON files
  panel.setAllowedFileTypes(['css', 'json']);

  const result = panel.runModal();

  if (result === NSModalResponseOK) {
    const url = panel.URL();
    if (url) {
      return String(url.path());
    }
  }

  return null;
}

/**
 * Shows a confirmation dialog for duplicate swatches
 * @param {string} name - Swatch name
 * @param {string} existingColor - Current color value
 * @param {string} newColor - New color value
 * @returns {string} - 'update', 'skip', 'updateAll', or 'skipAll'
 */
function showDuplicateDialog(name, existingColor, newColor) {
  const alert = NSAlert.alloc().init();

  alert.setMessageText(`Swatch "${name}" already exists`);
  alert.setInformativeText(
    `Current color: ${existingColor}\nNew color: ${newColor}\n\nWhat would you like to do?`
  );

  alert.addButtonWithTitle('Update');
  alert.addButtonWithTitle('Skip');
  alert.addButtonWithTitle('Update All');
  alert.addButtonWithTitle('Skip All');

  const response = alert.runModal();

  // NSAlertFirstButtonReturn = 1000, each subsequent button adds 1
  switch (response) {
    case 1000:
      return 'update';
    case 1001:
      return 'skip';
    case 1002:
      return 'updateAll';
    case 1003:
      return 'skipAll';
    default:
      return 'skip';
  }
}

/**
 * Finds an existing swatch by name
 * @param {Array} swatches - Document swatches
 * @param {string} name - Swatch name to find
 * @returns {Object|null} - Found swatch or null
 */
function findSwatchByName(swatches, name) {
  for (let i = 0; i < swatches.length; i++) {
    if (swatches[i].name === name) {
      return swatches[i];
    }
  }
  return null;
}

/**
 * Main import handler
 * @param {Object} context - Sketch context
 */
function onImportColors(context) {
  try {
    // Get the current document
    const document = sketch.getSelectedDocument();

    if (!document) {
      UI.message('Please open a Sketch document first');
      return;
    }

    // Show file picker
    const filePath = showOpenDialog();

    if (!filePath) {
      // User cancelled
      return;
    }

    // Read file contents
    const fileContent = readFile(filePath);
    if (fileContent === null) {
      UI.alert('Error', 'Could not read file. Please check the file exists and is readable.');
      return;
    }

    if (!fileContent || fileContent.trim().length === 0) {
      UI.alert('Error', 'The selected file is empty');
      return;
    }

    // Determine file type and parse
    let colors = [];
    const extension = filePath.toLowerCase().split('.').pop();

    if (extension === 'css') {
      colors = parseCSS(fileContent);
    } else if (extension === 'json') {
      colors = parseJSON(fileContent);
    } else {
      // Try to auto-detect
      if (isJSON(fileContent)) {
        colors = parseJSON(fileContent);
      } else if (isCSS(fileContent)) {
        colors = parseCSS(fileContent);
      } else {
        UI.alert('Error', 'Could not determine file format. Please use a .css or .json file.');
        return;
      }
    }

    if (colors.length === 0) {
      UI.alert('No Colors Found', 'No valid color values were found in the file.');
      return;
    }

    // Import colors as swatches
    let imported = 0;
    let updated = 0;
    let skipped = 0;
    let duplicateAction = null; // 'updateAll' or 'skipAll' for batch actions

    for (const colorDef of colors) {
      const existingSwatch = findSwatchByName(document.swatches, colorDef.name);

      if (existingSwatch) {
        // Handle duplicate
        let action = duplicateAction;

        if (!action) {
          action = showDuplicateDialog(
            colorDef.name,
            existingSwatch.color,
            colorDef.color
          );

          // Store batch action if selected
          if (action === 'updateAll') {
            duplicateAction = 'updateAll';
            action = 'update';
          } else if (action === 'skipAll') {
            duplicateAction = 'skipAll';
            action = 'skip';
          }
        } else {
          // Apply stored batch action
          action = duplicateAction === 'updateAll' ? 'update' : 'skip';
        }

        if (action === 'update') {
          existingSwatch.color = colorDef.color;
          updated++;
        } else {
          skipped++;
        }
      } else {
        // Create new swatch
        document.swatches.push({
          name: colorDef.name,
          color: colorDef.color
        });
        imported++;
      }
    }

    // Show summary
    const summaryParts = [];
    if (imported > 0) summaryParts.push(`${imported} imported`);
    if (updated > 0) summaryParts.push(`${updated} updated`);
    if (skipped > 0) summaryParts.push(`${skipped} skipped`);

    const summary = summaryParts.join(', ');
    UI.message(`Color import complete: ${summary}`);
  } catch (err) {
    UI.alert('Error', 'An error occurred: ' + String(err));
  }
}

module.exports = {
  onImportColors
};
