# Releasing Linkr

This checklist is for Linkr maintainers.

## Before release

1. Confirm `manifest.json`, `package.json`, `package-lock.json`, and `versions.json` use the same plugin version.
2. Install the locked dependencies with `npm install`.
3. Run `npm run check`.
4. Run `npm run lint`.
5. Run `npm run build`.
6. Test every enabled link type in a temporary Obsidian vault.
7. Test both states of **Embed content**.
8. Test every blank-link-text setting.
9. Test **Copy file link** and **Copy heading link…** from the File Explorer.
10. Test all three **Copy and paste** behaviors.
11. Test light and dark themes.
12. Confirm the repository contains no private information, local paths, secrets, or template placeholders.

## GitHub release

1. Commit and push the source changes to `main`.
2. Create a GitHub release tag that exactly matches the manifest version, such as `2.0.3`.
3. Do not add a `v` before the version.
4. Attach these separate files to the GitHub release:
   - `main.js`
   - `manifest.json`
   - `styles.css`
5. Publish the release.
6. Download the public assets and confirm they match the tested local files.

`main.js` is a generated release asset and is intentionally ignored by Git.

## Obsidian review

1. Confirm the default GitHub branch is `main`.
2. Confirm `manifest.json` at the head of `main` contains the released version.
3. Confirm the GitHub release tag exactly matches that version.
4. Wait for the current automated review to pass before publishing the directory listing.
5. If a blocking check fails, fix it and publish a new incremented release rather than replacing an existing release.
