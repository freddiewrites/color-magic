# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Color Magic is a Sketch plugin that imports color variables from CSS or JSON files into Sketch documents as Color Variables (Swatches). The plugin supports nested JSON structures, CSS custom properties, and multiple color formats (hex, rgb, rgba).

## Development Commands

Since this is a Sketch plugin without a build system, there are no build or test commands. The plugin runs directly in Sketch using JavaScript.

**Installation for testing:**
```bash
# Open the plugin in Sketch
open ColorMagic.sketchplugin
```

**Manual testing:**
After making changes, open the plugin in Sketch again to reload it, then test via Plugins → Color Magic → Import Colors...

## Architecture

### Plugin Structure

The plugin follows Sketch's plugin bundle format:
- `ColorMagic.sketchplugin/Contents/Sketch/manifest.json` - Plugin metadata and command definitions
- `ColorMagic.sketchplugin/Contents/Sketch/import-colors.js` - Main command handler
- `ColorMagic.sketchplugin/Contents/Sketch/parsers/` - File format parsers
- `ColorMagic.sketchplugin/Contents/Sketch/utils/` - Shared utilities

### Core Components

**Main Command Handler** (`import-colors.js`):
- Entry point for the "Import Colors..." command
- Handles file selection dialog via native macOS `NSOpenPanel`
- Reads files using native `NSString` APIs
- Manages duplicate swatch detection and user confirmation dialogs
- Updates Sketch document swatches via the Sketch JavaScript API

**Parsers**:
- `css-parser.js` - Extracts CSS custom properties (`--variable-name: value`) using regex
- `json-parser.js` - Recursively traverses JSON objects, joining nested keys with `/` separator

**Color Converter** (`color-converter.js`):
- Central utility for normalizing all color formats to Sketch's 8-character hex format (`#rrggbbaa`)
- Handles: `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb()`, `rgba()`
- All color values are validated and normalized through this utility before being added to Sketch

### Key Design Patterns

**Color Normalization Flow:**
1. Parser extracts raw color string from file
2. `parseColor()` attempts to normalize to `#rrggbbaa` format
3. If normalization fails, value is silently skipped (not all CSS/JSON values are colors)
4. Only successfully normalized colors are returned to main handler

**Duplicate Handling:**
- Batch operations: "Update All" or "Skip All" stores user preference for remaining duplicates
- Individual decisions: User can choose per-swatch with "Update" or "Skip"
- Dialog uses native `NSAlert` API showing existing vs. new color values

**Native macOS Integration:**
- Plugin uses Objective-C bridge (`NSOpenPanel`, `NSAlert`, `NSString`) for file operations and UI
- Required for file system access within Sketch's JavaScript context
- `MOPointer.alloc().init()` pattern for error handling in bridged APIs

## Supported Color Formats

The plugin only recognizes and imports valid color values:

**Hex formats**: `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`
**RGB formats**: `rgb(r, g, b)`, `rgba(r, g, b, a)`

Alpha values in `rgba()` support both 0-1 and 0-100 ranges (auto-detected).

## Plugin Requirements

- Sketch 70 or later (specified in manifest.json `compatibleVersion`)
- macOS (uses native Cocoa APIs)

## Code Conventions

- All modules use CommonJS (`require`/`module.exports`)
- Color values are always stored and passed as lowercase hex strings
- Swatch names preserve original casing from source file
- Nested JSON keys are joined with forward slash: `brand/primary/500`
- CSS variable names exclude the `--` prefix when used as swatch names
