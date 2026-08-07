# Linkr

**Linkr Gen 2** is a fast, keyboard-first wiki-link workflow for Obsidian, created by **@NameIsKyro**. Version 2.0.1 requires Obsidian 1.13.0 or later.

Press `Cmd+P` on macOS or `Ctrl+P` on Windows/Linux and choose a direct Linkr command, or open **Linkr: Add universal wiki link…** when you want the plugin to explain every format.

## Link formats

| Type | Plain | With name |
| --- | --- | --- |
| File | `[[my_file]]` | `[[my_file\|photosynthesis]]` |
| Heading | `[[my_file#Heading]]` | `[[my_file#Heading\|photosynthesis]]` |
| Block | `[[my_file#^block-id]]` | `[[my_file#^block-id\|important idea]]` |
| File embed | `![[my_file]]` | `![[my_file\|photosynthesis]]` |
| Heading embed | `![[my_file#Heading]]` | `![[my_file#Heading\|photosynthesis]]` |
| Block embed | `![[my_file#^block-id]]` | `![[my_file#^block-id\|important idea]]` |

## Gen 2 features

- Twelve direct commands covering file, heading, block, and embed links.
- An extra **Insert normal wiki link** command for discoverability.
- A separate, beginner-friendly universal command with examples.
- The five most recently selected files appear first by default.
- Named links accept blank input: Linkr automatically uses the heading, block text, or file name after `|`.
- Existing editor selection is still prefilled as the link name.
- File links and file embeds can target attachments as well as Markdown notes.
- Heading and block pickers use Obsidian’s metadata, with safe parsing fallbacks.
- Type a new note name in the file picker to create and link it when no exact note exists.
- New notes follow Obsidian’s configured new-note location.
- Full settings for alias fallback, recent-file count, picker paths, universal ordering, and new-note creation.
- Escape, Cancel, and the × button safely close every popup.
- Responsive, native-feeling UI with subtle `@NameIsKyro` branding.

## Blank-name behaviour

For a named heading link, leave the name input blank and press Enter or click **Insert wiki link**:

```text
[[Biology#Photosynthesis|Photosynthesis]]
```

For file links, Linkr falls back to the file name. For blocks, it uses the visible block text when available. This can be changed under **Settings → Linkr**.

## Creating a note from search

For file links and file embeds, type a name that does not exactly match an existing file. Linkr offers **Create “Note name”** at the end of the results. Selecting it creates a Markdown note in Obsidian’s configured new-note location and immediately links it.

Creation is intentionally unavailable during heading/block flows because a new empty note does not yet contain a target heading or block.

## Install manually

1. Extract the `linkr` folder into your vault’s `.obsidian/plugins/` folder.
2. Restart Obsidian or reload community plugins.
3. Open **Settings → Community plugins** and enable **Linkr**.

The final folder should contain:

```text
.obsidian/plugins/linkr/
├── main.js
├── manifest.json
└── styles.css
```

## Development

```bash
npm install
npm run build
```

## License

MIT © 2026 @NameIsKyro
