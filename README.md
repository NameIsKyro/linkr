# Linkr

Linkr is a fast, keyboard-friendly link builder for Obsidian. It creates wiki links to files, headings, and block IDs, with optional display text and one-click embeds.

Version 2.0.2 requires Obsidian 1.13.0 or later.

## Features

- Native-looking file, heading, block, and link-type pickers.
- A universal link builder containing only the link types you enable.
- Direct commands for each enabled link type.
- An **Embed content** toggle on every final link screen. Turn it on to change `[[...]]` into `![[...]]`.
- Live preview before a link is inserted.
- Configurable behavior when a display-text field is left blank.
- Existing editor selections are prefilled as display text.
- File links can target Markdown notes and attachments.
- Heading and block links use Obsidian metadata with safe parsing fallbacks.
- Up to ten recently selected files can appear first.
- Optional creation of a missing Markdown note from the file picker.
- New notes follow Obsidian's configured new-note location.
- Escape, Cancel, and the close button safely cancel without changing the note.
- Light theme, dark theme, keyboard, and mobile-compatible UI.
- No telemetry, analytics, advertising, or network requests.

## Link types

| Link type | Normal | Embed content enabled | Default |
| --- | --- | --- | --- |
| Wiki link | `[[my_file]]` | `![[my_file]]` | Enabled |
| File link with text | `[[my_file\|photosynthesis]]` | `![[my_file\|photosynthesis]]` | Enabled |
| Heading link with text | `[[my_file#Heading\|photosynthesis]]` | `![[my_file#Heading\|photosynthesis]]` | Enabled |
| Block link with text | `[[my_file#^block-id\|important idea]]` | `![[my_file#^block-id\|important idea]]` | Enabled |
| Heading link | `[[my_file#Heading]]` | `![[my_file#Heading]]` | Disabled |
| Block link | `[[my_file#^block-id]]` | `![[my_file#^block-id]]` | Disabled |

The two no-text subpath links are off by default to keep the command palette and universal picker focused. Enable either one under **Settings → Linkr → Link types**.

## Commands

Obsidian automatically displays these commands with the `Linkr:` prefix:

- **Open link builder…** — choose any enabled link type from one universal picker.
- **Insert wiki link** — create a file link without display text.
- **Insert file link with text** — create a file link with optional display text.
- **Insert heading link with text** — choose a file and heading, then enter display text.
- **Insert block link with text** — choose a file and explicit block ID, then enter display text.
- **Insert heading link** — create a heading link without display text when this type is enabled.
- **Insert block link** — create a block link without display text when this type is enabled.

Disabled link types are unavailable until they are enabled in Linkr settings.

## Recommended hotkey

Linkr does not force a default hotkey because Obsidian community plugins should let each user choose shortcuts and resolve conflicts.

The recommended universal shortcut is:

- macOS: `Command+Option+/`
- Windows/Linux: `Ctrl+Alt+/`

To assign it:

1. Open **Settings → Hotkeys** in Obsidian.
2. Search for `Linkr: Open link builder`.
3. Select the plus button beside the command.
4. Press the recommended key combination.
5. If Obsidian reports a conflict, choose another combination that is free in your vault.

## Using Linkr

1. Run **Linkr: Open link builder…** from the command palette or your assigned hotkey.
2. Choose an enabled link type.
3. Select a file.
4. For heading or block links, select the target inside that file.
5. Enter link text when the selected type supports it. You can also leave it blank.
6. Turn on **Embed content** if you want Linkr to add `!` before the wiki link.
7. Review the exact Markdown in the preview.
8. Press Enter or select **Insert link**.

Press Escape, select **Cancel**, or use the close button at any stage to stop without inserting anything.

## Blank link text

Under **Settings → Linkr → Link text**, choose what happens when a link-text field is blank. Text you type always takes priority.

| Setting | Heading-link result |
| --- | --- |
| Target name | `[[file#heading1\|heading1]]` |
| File > target | `[[file#heading1\|file > heading1]]` |
| File name | `[[file#heading1\|file]]` |
| Generic text | `[[file#heading1\|link]]` |
| No link text | `[[file#heading1]]` |

For block links, **Target name** uses visible block text when available. For file links, it uses the file name.

## Settings

### Link types

Enable or disable the choices shown in the universal picker and their matching direct commands. Wiki link is enabled by default; heading and block links without display text are disabled by default.

### Link text

Choose the fallback used when display text is blank.

### Universal command

- View the recommended hotkey.
- Choose which enabled type appears first.
- Optionally move the last-used type to the top.

### File picker

- Choose how many recently used files appear first, from zero to ten.
- Show or hide folder paths.
- Clear Linkr's recent-file ordering without changing vault files.

### New notes

- Allow Linkr to offer a new Markdown note when a file search has no exact match.
- Optionally give new notes an H1 title matching the file name.

## Creating a note from search

For file links, type a name that does not exactly match an existing file. Linkr offers **Create “Note name”** at the end of the results. Selecting it creates a Markdown note in Obsidian's configured new-note location and continues the link flow.

Creation is unavailable during heading and block flows because a new empty note does not yet contain a heading or block target.

## Installation

After Linkr is accepted into the Community Plugins directory:

1. Open **Settings → Community plugins**.
2. Select **Browse** and search for `Linkr`.
3. Select **Install**, then **Enable**.

### Manual installation

Download these files from the matching GitHub release:

- `main.js`
- `manifest.json`
- `styles.css`

Place them in:

```text
<your-vault>/.obsidian/plugins/linkr/
```

Restart Obsidian or reload community plugins, then enable Linkr under **Settings → Community plugins**.

## Compatibility

- Minimum Obsidian version: 1.13.0
- Desktop: supported
- Mobile: supported
- Desktop-only APIs: not used

## Privacy and security

Linkr works entirely inside Obsidian. It does not send network requests, collect analytics, use telemetry, show advertising, or transmit note contents. Its saved plugin data contains only Linkr settings and recently selected vault-relative file paths.

## Known limitations

- Block links require explicit Obsidian block IDs such as `^block-id`.
- A newly created note cannot immediately be used for a heading or block link because it has no targets yet.
- Shortcut availability depends on the user's Obsidian configuration and installed plugins.

## Development

```bash
npm install
npm run check
npm run lint
npm run build
```

The production build creates `main.js`. Keep `main.js` out of source commits and attach it to the GitHub release with `manifest.json` and `styles.css`.

## Support

Report problems or request features through the [Linkr issue tracker](https://github.com/NameIsKyro/linkr/issues).

## License

Linkr is available under the [MIT License](LICENSE).

---

Crafted by [@NameIsKyro](https://github.com/NameIsKyro).
