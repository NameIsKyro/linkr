# Changelog

All notable changes to Linkr are recorded here.

## 2.0.3

- Added **Copy file link** to file context menus in Obsidian's File Explorer.
- Added **Copy heading link…** for choosing and copying a heading from a Markdown file.
- Added command-palette alternatives for copying the active file or one of its headings.
- Added an optional paste-time popup with **Use link text** and **Embed content** toggles.
- Added copy behaviors for asking on paste, pasting without link text, or using the file name automatically.
- Standardized visible naming around **Link builder**.
- Removed development dependencies from the delivered folder to keep the download small.

## 2.0.2

- Added an **Embed content** toggle to the final screen for every link type.
- Replaced separate embed choices with one consistent `![[...]]` option.
- Added per-link-type enable switches.
- Kept Wiki link enabled by default and disabled no-text heading and block links by default.
- Renamed link choices and commands for clarity.
- Added blank-text choices for target name, `File > target`, file name, `link`, or no display text.
- Added the recommended universal shortcut instructions without forcing a default hotkey.
- Preserved the existing Linkr modal design and added live embed previews.
- Updated documentation and release metadata.

## 2.0.1

- Updated the settings implementation and minimum Obsidian version for community review compatibility.
- Added Obsidian-specific linting.

## 2.0.0

- Added universal file, heading, block, and embed workflows.
- Added recent-file ordering, new-note creation, blank-name fallback, and native-style pickers.
