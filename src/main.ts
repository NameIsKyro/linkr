import {
  BlockCache,
  Editor,
  MarkdownFileInfo,
  MarkdownView,
  normalizePath,
  Notice,
  Plugin,
  TFile,
} from 'obsidian';
import {
  buildDestinationText,
  buildWikiLink,
  getFallbackAlias,
  sanitizeNewNoteName,
} from './link-format';
import {
  BlockPickerModal,
  FilePickerChoice,
  FilePickerModal,
  HeadingPickerModal,
  LinkOptionsModal,
  UniversalLinkPickerModal,
} from './modals';
import {
  DEFAULT_SETTINGS,
  LinkrSettingTab,
} from './settings';
import type {
  BlockChoice,
  DestinationChoice,
  HeadingChoice,
  InsertionTarget,
  LinkOption,
  LinkRequest,
  LinkrSettings,
} from './types';
import {
  getLinkOption,
  isLinkOptionEnabled,
  LINK_OPTIONS,
  normalizeLinkOptionId,
} from './types';

interface DirectCommand {
  id: string;
  name: string;
  optionId: string;
}

const DIRECT_COMMANDS: DirectCommand[] = [
  {
    id: 'insert-normal-wiki-link',
    name: 'Insert wiki link',
    optionId: 'file-plain',
  },
  {
    id: 'insert-file-link-with-name',
    name: 'Insert file link with text',
    optionId: 'file-named',
  },
  {
    id: 'insert-heading-link-with-name',
    name: 'Insert heading link with text',
    optionId: 'heading-named',
  },
  {
    id: 'insert-block-link-with-name',
    name: 'Insert block link with text',
    optionId: 'block-named',
  },
  {
    id: 'insert-heading-link-plain',
    name: 'Insert heading link',
    optionId: 'heading-plain',
  },
  {
    id: 'insert-block-link-plain',
    name: 'Insert block link',
    optionId: 'block-plain',
  },
];

export default class LinkrPlugin extends Plugin {
  settings: LinkrSettings = { ...DEFAULT_SETTINGS };

  async onload(): Promise<void> {
    await this.loadSettings();

    for (const command of DIRECT_COMMANDS) {
      this.registerDirectCommand(command);
    }

    this.addCommand({
      id: 'add-universal-wiki-link',
      name: 'Open link builder…',
      editorCallback: (
        editor: Editor,
        context: MarkdownView | MarkdownFileInfo,
      ) => {
        const options = this.getOrderedUniversalOptions();
        if (options.length === 0) {
          new Notice('No link types are enabled. Turn one on in the plugin settings.');
          return;
        }
        const target = this.captureTarget(editor, context.file?.path ?? '');
        new UniversalLinkPickerModal(
          this.app,
          options,
          (option) => {
            void this.rememberUniversalOption(option);
            this.startLinkFlow(target, option.request);
          },
        ).open();
      },
    });

    this.addSettingTab(new LinkrSettingTab(this.app, this));
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  private async loadSettings(): Promise<void> {
    const saved = (await this.loadData()) as Partial<LinkrSettings> | null;
    this.settings = Object.assign({}, DEFAULT_SETTINGS, saved ?? {});
    const legacyFallback = (saved as { aliasFallback?: string } | null)?.aliasFallback;
    if (legacyFallback === 'destination') {
      this.settings.aliasFallback = 'target';
    } else if (legacyFallback === 'empty') {
      this.settings.aliasFallback = 'none';
    }
    this.settings.preferredUniversalOption = normalizeLinkOptionId(
      this.settings.preferredUniversalOption,
    );
    this.settings.lastUniversalOption = normalizeLinkOptionId(
      this.settings.lastUniversalOption,
    );
    this.settings.recentFilePaths = Array.isArray(this.settings.recentFilePaths)
      ? this.settings.recentFilePaths.filter((path): path is string => typeof path === 'string')
      : [];
  }

  private registerDirectCommand(command: DirectCommand): void {
    const option = getLinkOption(command.optionId);
    this.addCommand({
      id: command.id,
      name: command.name,
      editorCheckCallback: (
        checking: boolean,
        editor: Editor,
        context: MarkdownView | MarkdownFileInfo,
      ) => {
        if (!isLinkOptionEnabled(option, this.settings)) {
          return false;
        }
        if (checking) {
          return true;
        }
        const target = this.captureTarget(editor, context.file?.path ?? '');
        this.startLinkFlow(target, option.request);
        return true;
      },
    });
  }

  private captureTarget(editor: Editor, sourcePath: string): InsertionTarget {
    return {
      editor,
      from: editor.getCursor('from'),
      to: editor.getCursor('to'),
      sourcePath,
      suggestedAlias: editor.getSelection().replace(/\r?\n/g, ' ').trim(),
    };
  }

  private startLinkFlow(target: InsertionTarget, request: LinkRequest): void {
    new FilePickerModal(this.app, {
      markdownOnly: request.subpath !== 'file',
      allowCreate:
        request.subpath === 'file' && this.settings.allowCreateNotes,
      recentPaths: this.settings.recentFilePaths,
      recentLimit: this.settings.recentFileLimit,
      showPaths: this.settings.showFilePaths,
      onChoose: (choice) => {
        void this.afterFilePicker(choice, target, request);
      },
    }).open();
  }

  private async afterFilePicker(
    choice: FilePickerChoice,
    target: InsertionTarget,
    request: LinkRequest,
  ): Promise<void> {
    const file =
      choice.kind === 'file'
        ? choice.file
        : await this.createNote(choice.noteName, target.sourcePath);

    if (!file) {
      return;
    }

    await this.trackRecentFile(file);

    if (request.subpath === 'heading') {
      const headings = await this.getHeadings(file);
      if (headings.length === 0) {
        new Notice(`No headings found in “${file.basename}”.`);
        return;
      }
      new HeadingPickerModal(this.app, file, headings, (heading) => {
        this.finishDestination({ file, heading }, target, request);
      }).open();
      return;
    }

    if (request.subpath === 'block') {
      const blocks = await this.getBlocks(file);
      if (blocks.length === 0) {
        new Notice(`No explicit block IDs found in “${file.basename}”.`);
        return;
      }
      new BlockPickerModal(this.app, file, blocks, (block) => {
        this.finishDestination({ file, block }, target, request);
      }).open();
      return;
    }

    this.finishDestination({ file }, target, request);
  }

  private finishDestination(
    destination: DestinationChoice,
    target: InsertionTarget,
    request: LinkRequest,
  ): void {
    const fileLink = this.app.metadataCache.fileToLinktext(
      destination.file,
      target.sourcePath,
      true,
    );
    const destinationText = buildDestinationText(fileLink, destination);
    const fallbackAlias = request.named
      ? getFallbackAlias(destination, this.settings.aliasFallback)
      : null;
    new LinkOptionsModal(
      this.app,
      destinationText,
      request,
      target.suggestedAlias,
      fallbackAlias,
      this.settings.aliasFallback,
      (alias, embed) => {
        const finalRequest = { ...request, embed };
        this.insertLink(buildWikiLink(destinationText, finalRequest, alias), target);
      },
    ).open();
  }

  private insertLink(link: string, target: InsertionTarget): void {
    target.editor.replaceRange(link, target.from, target.to);
    target.editor.setCursor({
      line: target.from.line,
      ch: target.from.ch + link.length,
    });
    target.editor.focus();
  }

  private async getHeadings(file: TFile): Promise<HeadingChoice[]> {
    const cachedHeadings = this.app.metadataCache.getFileCache(file)?.headings;
    if (cachedHeadings) {
      return cachedHeadings.map((heading) => ({
        heading: heading.heading,
        level: heading.level,
        line: heading.position.start.line + 1,
      }));
    }

    const content = await this.app.vault.cachedRead(file);
    return parseHeadings(content);
  }

  private async getBlocks(file: TFile): Promise<BlockChoice[]> {
    const content = await this.app.vault.cachedRead(file);
    const lines = content.split(/\r?\n/);
    const cachedBlocks = this.app.metadataCache.getFileCache(file)?.blocks;

    if (cachedBlocks) {
      return Object.values(cachedBlocks)
        .sort(
          (a: BlockCache, b: BlockCache) =>
            a.position.start.line - b.position.start.line,
        )
        .map((block) => {
          const line = block.position.start.line;
          return {
            id: block.id,
            label: blockLabel(lines[line] ?? '', block.id),
            line: line + 1,
          };
        });
    }

    return parseBlocks(lines);
  }

  private async createNote(
    requestedName: string,
    sourcePath: string,
  ): Promise<TFile | null> {
    const noteName = sanitizeNewNoteName(requestedName);
    if (!noteName) {
      new Notice('Enter a valid note name before creating it.');
      return null;
    }

    const fileName = `${noteName}.md`;
    const parent = this.app.fileManager.getNewFileParent(sourcePath, fileName);
    const path = normalizePath(parent.path ? `${parent.path}/${fileName}` : fileName);
    const existing = this.app.vault.getAbstractFileByPath(path);
    if (existing instanceof TFile) {
      return existing;
    }
    if (existing) {
      new Notice(`Cannot create “${noteName}” because that path is already in use.`);
      return null;
    }

    const content = this.settings.addHeadingToNewNotes ? `# ${noteName}\n` : '';
    try {
      const file = await this.app.vault.create(path, content);
      new Notice(`Created “${file.basename}”.`);
      return file;
    } catch (error) {
      console.error('Linkr could not create a note', error);
      new Notice(`Could not create “${noteName}”.`);
      return null;
    }
  }

  private async trackRecentFile(file: TFile): Promise<void> {
    this.settings.recentFilePaths = [
      file.path,
      ...this.settings.recentFilePaths.filter((path) => path !== file.path),
    ].slice(0, 30);
    await this.saveSettings();
  }

  private getOrderedUniversalOptions(): LinkOption[] {
    const preferred =
      this.settings.rememberLastUniversalOption &&
      this.settings.lastUniversalOption
        ? this.settings.lastUniversalOption
        : this.settings.preferredUniversalOption;
    return LINK_OPTIONS.filter((option) =>
      isLinkOptionEnabled(option, this.settings),
    ).sort((a, b) => {
      if (a.id === preferred) return -1;
      if (b.id === preferred) return 1;
      return 0;
    });
  }

  private async rememberUniversalOption(option: LinkOption): Promise<void> {
    this.settings.lastUniversalOption = option.id;
    await this.saveSettings();
  }
}

function parseHeadings(content: string): HeadingChoice[] {
  const headings: HeadingChoice[] = [];
  const lines = content.split(/\r?\n/);
  let inFence = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? '';
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const atx = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (atx?.[1] && atx[2]) {
      headings.push({ heading: atx[2], level: atx[1].length, line: index + 1 });
      continue;
    }

    const underline = lines[index + 1]?.match(/^\s{0,3}(=+|-+)\s*$/);
    if (line.trim() && underline?.[1]) {
      headings.push({
        heading: line.trim(),
        level: underline[1].startsWith('=') ? 1 : 2,
        line: index + 1,
      });
    }
  }
  return headings;
}

function parseBlocks(lines: string[]): BlockChoice[] {
  const blocks: BlockChoice[] = [];
  lines.forEach((line, index) => {
    const match = line.match(/\^([\w-]+)\s*$/);
    if (match?.[1]) {
      blocks.push({
        id: match[1],
        label: blockLabel(line, match[1]),
        line: index + 1,
      });
    }
  });
  return blocks;
}

function blockLabel(line: string, id: string): string {
  const cleaned = line
    .replace(new RegExp(`\\s*\\^${escapeRegExp(id)}\\s*$`), '')
    .replace(/^\s*(?:[-*+]\s+|\d+[.)]\s+|>\s*)/, '')
    .replace(/^\[[ xX-]\]\s*/, '')
    .trim();
  return cleaned ? truncate(cleaned, 90) : `Block ${id}`;
}

function truncate(value: string, length: number): string {
  return value.length <= length ? value : `${value.slice(0, length - 1)}…`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
