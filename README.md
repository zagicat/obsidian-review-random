# Review Random

An [Obsidian](https://obsidian.md) plugin that opens a random note from your vault that carries a configurable tag. Useful for working through a backlog of articles, books, or any notes you've marked for later review.

## Features

- Adds a **Review Random: Open random article** command to the command palette
- Configurable tag — any tag in your vault can serve as the review queue (default: `review-needed`)
- Configurable folder exclusions — specify top-level folders to skip (default: `Clippings`)
- Works with both frontmatter tags and inline tags
- Shows a notice if no eligible notes are found

## Usage

1. Tag any note you want to add to your review queue — either in frontmatter:
   ```yaml
   ---
   tags: [review-needed]
   ---
   ```
   or inline anywhere in the note body:
   ```
   #review-needed
   ```

2. Open the command palette (`Cmd+P` / `Ctrl+P`) and run **Review Random: Open random article**

3. The plugin picks a random eligible note and opens it

## Settings

Go to **Settings → Community Plugins → Review Random** to configure:

| Setting | Description | Default |
|---|---|---|
| Review tag | Tag that marks a note as eligible for random review | `review-needed` |
| Excluded folders | Comma-separated list of top-level folders to exclude | `Clippings` |

Example excluded folders: `Clippings, Archive, Templates`

## Installation

This plugin is not yet listed in the Obsidian community plugin registry. To install manually:

1. Download or clone this repository
2. Run `npm install && npm run build`
3. Copy `main.js` and `manifest.json` into your vault at `.obsidian/plugins/review-random/`
4. In Obsidian, go to **Settings → Community Plugins**, reload the plugin list, and enable **Review Random**

## Development

```bash
npm install       # install dependencies
npm test          # run unit tests
npm run build     # compile main.ts → main.js (production)
npm run dev       # compile in watch mode (development)
```

After rebuilding, reload the plugin in Obsidian (disable and re-enable it, or use **Reload app without saving**).

## License

MIT
