# Color Magic

A Sketch plugin that imports color variables from CSS or JSON files into your Sketch document as Color Variables (Swatches).

![Color Magic Demo](https://github.com/user-attachments/assets/7e50e787-5f36-4253-a0a3-0df7f1d11a25)


## Installation

1. [Download the latest release](https://github.com/freddiewrites/color-magic/releases/latest/download/ColorMagic.sketchplugin.zip)
2. Unzip and double-click `ColorMagic.sketchplugin` to install

## Usage

1. Open a Sketch document
2. Go to **Plugins → Color Magic → Import Colors...**
3. Select a `.css` or `.json` file containing your colors
4. Colors are imported as Color Variables (Swatches)

## Supported Formats

### CSS Custom Properties

```css
:root {
  --primary: #ff6600;
  --secondary: rgba(51, 51, 51, 1);
  --accent: #c0ffee;
}
```

### JSON (flat or nested)

```json
{
  "primary": "#ff6600",
  "brand": {
    "accent": "#c0ffee",
    "dark": "rgba(0, 0, 0, 0.8)"
  }
}
```

Nested JSON keys are joined with `/` separators (e.g., `brand/accent`).

## Supported Color Formats

- Hex: `#rgb`, `#rrggbb`, `#rrggbbaa`
- RGB: `rgb(255, 128, 0)`
- RGBA: `rgba(255, 128, 0, 0.5)`

## Duplicate Handling

When importing colors that already exist in your document, you'll be prompted to:

- **Update** – Replace the existing color with the new value
- **Skip** – Keep the existing color unchanged
- **Update All** – Update this and all remaining duplicates
- **Skip All** – Skip this and all remaining duplicates

## Requirements

- Sketch 70 or later

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

Freddie Harrison
