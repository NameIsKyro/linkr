import {
  App,
  ButtonComponent,
  FuzzyMatch,
  FuzzySuggestModal,
  Modal,
  prepareFuzzySearch,
  SearchResult,
  setIcon,
  Setting,
  sortSearchResults,
  SuggestModal,
  TFile,
  TextComponent,
} from 'obsidian';
import { buildWikiLink } from './link-format';
import type {
  AliasFallbackMode,
  BlockChoice,
  HeadingChoice,
  LinkOption,
  LinkRequest,
} from './types';

const BRAND = '@NameIsKyro';

export type FilePickerChoice =
  | { kind: 'file'; file: TFile }
  | { kind: 'create'; noteName: string };

interface FileMatchSuggestion {
  kind: 'file';
  file: TFile;
  match: SearchResult;
  recentRank: number;
}

interface CreateSuggestion {
  kind: 'create';
  noteName: string;
}

type FileSuggestion = FileMatchSuggestion | CreateSuggestion;

interface FilePickerOptions {
  markdownOnly: boolean;
  allowCreate: boolean;
  recentPaths: string[];
  recentLimit: number;
  showPaths: boolean;
  onChoose: (choice: FilePickerChoice) => void;
}

export class FilePickerModal extends SuggestModal<FileSuggestion> {
  private readonly files: TFile[];
  private readonly options: FilePickerOptions;
  private readonly recentRanks: Map<string, number>;

  constructor(app: App, options: FilePickerOptions) {
    super(app);
    this.options = options;
    this.files = options.markdownOnly
      ? app.vault.getMarkdownFiles()
      : app.vault.getFiles();
    this.recentRanks = new Map(
      options.recentPaths
        .slice(0, options.recentLimit)
        .map((path, index) => [path, index]),
    );
    this.limit = 60;
    this.emptyStateText = options.markdownOnly
      ? 'No matching Markdown notes'
      : 'No matching files';
    this.setPlaceholder('Search files by name or path…');
    this.setInstructions([
      { command: '↑↓', purpose: 'navigate' },
      { command: '↵', purpose: 'select' },
      { command: 'esc', purpose: 'cancel' },
    ]);
  }

  async onOpen(): Promise<void> {
    await super.onOpen();
    addPickerChrome(this, 'Choose a file', 'Files');
  }

  getSuggestions(query: string): FileSuggestion[] {
    const trimmedQuery = query.trim();
    const fuzzySearch = prepareFuzzySearch(trimmedQuery);
    const matches: FileMatchSuggestion[] = [];

    for (const file of this.files) {
      const searchableText = `${file.basename} ${file.path}`;
      const match = trimmedQuery
        ? fuzzySearch(searchableText)
        : { score: 0, matches: [] };

      if (match) {
        matches.push({
          kind: 'file',
          file,
          match,
          recentRank: this.recentRanks.get(file.path) ?? Number.MAX_SAFE_INTEGER,
        });
      }
    }

    if (trimmedQuery) {
      sortSearchResults(matches);
    } else {
      matches.sort((a, b) =>
        a.file.path.localeCompare(b.file.path, undefined, {
          sensitivity: 'base',
        }),
      );
    }

    matches.sort((a, b) => {
      const recentDifference = a.recentRank - b.recentRank;
      if (recentDifference !== 0) {
        return recentDifference;
      }
      return 0;
    });

    const suggestions: FileSuggestion[] = matches;
    if (
      this.options.allowCreate &&
      trimmedQuery.length > 0 &&
      !this.hasExactMatch(trimmedQuery)
    ) {
      return [
        ...suggestions.slice(0, Math.max(0, this.limit - 1)),
        { kind: 'create', noteName: trimmedQuery },
      ];
    }

    return suggestions;
  }

  renderSuggestion(suggestion: FileSuggestion, el: HTMLElement): void {
    if (suggestion.kind === 'create') {
      const row = el.createDiv({ cls: 'linkr-suggestion linkr-create-note' });
      const icon = row.createSpan({ cls: 'linkr-suggestion-icon' });
      setIcon(icon, 'file-plus-2');
      const copy = row.createDiv({ cls: 'linkr-suggestion-copy' });
      copy.createDiv({
        cls: 'linkr-suggestion-title',
        text: `Create “${suggestion.noteName}”`,
      });
      copy.createDiv({
        cls: 'linkr-suggestion-path',
        text: 'Create a new Markdown note and link it',
      });
      row.createSpan({ cls: 'linkr-new-badge', text: 'NEW' });
      return;
    }

    const row = el.createDiv({ cls: 'linkr-suggestion' });
    const icon = row.createSpan({ cls: 'linkr-suggestion-icon' });
    setIcon(icon, iconForFile(suggestion.file));
    const copy = row.createDiv({ cls: 'linkr-suggestion-copy' });
    copy.createDiv({
      cls: 'linkr-suggestion-title',
      text:
        suggestion.file.extension.toLocaleLowerCase() === 'md'
          ? suggestion.file.basename
          : suggestion.file.name,
    });

    if (this.options.showPaths) {
      copy.createDiv({
        cls: 'linkr-suggestion-path',
        text: parentPath(suggestion.file),
      });
    }

    if (suggestion.recentRank !== Number.MAX_SAFE_INTEGER) {
      row.createSpan({ cls: 'linkr-recent-badge', text: 'RECENT' });
    }
  }

  onChooseSuggestion(suggestion: FileSuggestion): void {
    if (suggestion.kind === 'create') {
      this.options.onChoose({
        kind: 'create',
        noteName: suggestion.noteName,
      });
      return;
    }

    this.options.onChoose({ kind: 'file', file: suggestion.file });
  }

  private hasExactMatch(query: string): boolean {
    const normalized = query.toLocaleLowerCase().replace(/\.md$/i, '');
    return this.files.some(
      (file) =>
        file.basename.toLocaleLowerCase() === normalized ||
        file.path.toLocaleLowerCase().replace(/\.md$/i, '') === normalized,
    );
  }
}

export class HeadingPickerModal extends FuzzySuggestModal<HeadingChoice> {
  constructor(
    app: App,
    private readonly file: TFile,
    private readonly headings: HeadingChoice[],
    private readonly onChoose: (heading: HeadingChoice) => void,
  ) {
    super(app);
    this.setPlaceholder(`Search headings in ${file.basename}…`);
    this.setInstructions([
      { command: '↑↓', purpose: 'navigate' },
      { command: '↵', purpose: 'select' },
      { command: 'esc', purpose: 'cancel' },
    ]);
  }

  async onOpen(): Promise<void> {
    await super.onOpen();
    addPickerChrome(this, `Choose a heading · ${this.file.basename}`, 'Headings');
  }

  getItems(): HeadingChoice[] {
    return this.headings;
  }

  getItemText(heading: HeadingChoice): string {
    return `${heading.heading} H${heading.level} line ${heading.line}`;
  }

  renderSuggestion(match: FuzzyMatch<HeadingChoice>, el: HTMLElement): void {
    const row = el.createDiv({ cls: 'linkr-suggestion' });
    row.addClass(`linkr-heading-depth-${Math.max(0, match.item.level - 1)}`);
    row.createSpan({
      cls: 'linkr-heading-level',
      text: `H${match.item.level}`,
    });
    const copy = row.createDiv({ cls: 'linkr-suggestion-copy' });
    copy.createDiv({ cls: 'linkr-suggestion-title', text: match.item.heading });
    copy.createDiv({
      cls: 'linkr-suggestion-path',
      text: `Line ${match.item.line}`,
    });
  }

  onChooseItem(heading: HeadingChoice): void {
    this.onChoose(heading);
  }
}

export class BlockPickerModal extends FuzzySuggestModal<BlockChoice> {
  constructor(
    app: App,
    private readonly file: TFile,
    private readonly blocks: BlockChoice[],
    private readonly onChoose: (block: BlockChoice) => void,
  ) {
    super(app);
    this.setPlaceholder(`Search blocks in ${file.basename}…`);
    this.setInstructions([
      { command: '↑↓', purpose: 'navigate' },
      { command: '↵', purpose: 'select' },
      { command: 'esc', purpose: 'cancel' },
    ]);
  }

  async onOpen(): Promise<void> {
    await super.onOpen();
    addPickerChrome(this, `Choose a block · ${this.file.basename}`, 'Blocks');
  }

  getItems(): BlockChoice[] {
    return this.blocks;
  }

  getItemText(block: BlockChoice): string {
    return `${block.label} ${block.id} line ${block.line}`;
  }

  renderSuggestion(match: FuzzyMatch<BlockChoice>, el: HTMLElement): void {
    const row = el.createDiv({ cls: 'linkr-suggestion' });
    const id = row.createSpan({ cls: 'linkr-block-id', text: `^${match.item.id}` });
    id.setAttr('title', `Block ID: ${match.item.id}`);
    const copy = row.createDiv({ cls: 'linkr-suggestion-copy' });
    copy.createDiv({ cls: 'linkr-suggestion-title', text: match.item.label });
    copy.createDiv({
      cls: 'linkr-suggestion-path',
      text: `Line ${match.item.line}`,
    });
  }

  onChooseItem(block: BlockChoice): void {
    this.onChoose(block);
  }
}

export class UniversalLinkPickerModal extends FuzzySuggestModal<LinkOption> {
  constructor(
    app: App,
    private readonly options: LinkOption[],
    private readonly onChoose: (option: LinkOption) => void,
  ) {
    super(app);
    this.setPlaceholder('What kind of wiki link do you want to add?');
    this.setInstructions([
      { command: 'type', purpose: 'filter by file, heading, or block' },
      { command: '↵', purpose: 'choose' },
      { command: 'esc', purpose: 'cancel' },
    ]);
  }

  async onOpen(): Promise<void> {
    await super.onOpen();
    addPickerChrome(this, 'Build a wiki link', 'Linkr');
  }

  getItems(): LinkOption[] {
    return this.options;
  }

  getItemText(option: LinkOption): string {
    return `${option.title} ${option.description} ${option.example}`;
  }

  renderSuggestion(match: FuzzyMatch<LinkOption>, el: HTMLElement): void {
    const row = el.createDiv({ cls: 'linkr-suggestion linkr-universal-option' });
    const icon = row.createSpan({ cls: 'linkr-suggestion-icon' });
    setIcon(icon, match.item.icon);
    const copy = row.createDiv({ cls: 'linkr-suggestion-copy' });
    copy.createDiv({ cls: 'linkr-suggestion-title', text: match.item.title });
    copy.createDiv({ cls: 'linkr-suggestion-path', text: match.item.description });
    row.createEl('code', { cls: 'linkr-example', text: match.item.example });
  }

  onChooseItem(option: LinkOption): void {
    this.onChoose(option);
  }
}

export class LinkOptionsModal extends Modal {
  private input?: TextComponent;
  private previewEl?: HTMLElement;
  private embed: boolean;

  constructor(
    app: App,
    private readonly destinationText: string,
    private readonly request: LinkRequest,
    private readonly initialAlias: string,
    private readonly fallbackAlias: string | null,
    private readonly fallbackMode: AliasFallbackMode,
    private readonly onSubmit: (alias: string | null, embed: boolean) => void,
  ) {
    super(app);
    this.embed = request.embed;
  }

  onOpen(): void {
    this.modalEl.addClass('linkr-modal', 'linkr-alias-modal');
    addBrandHeader(
      this.contentEl,
      this.request.named ? 'Add link text' : 'Review wiki link',
      'Final step',
    );

    if (this.request.named) {
      const field = this.contentEl.createDiv({ cls: 'linkr-field' });
      const inputId = `linkr-alias-${Date.now()}`;
      field.createEl('label', { attr: { for: inputId }, text: 'Link text' });
      this.input = new TextComponent(field)
        .setPlaceholder(this.getPlaceholder())
        .setValue(this.initialAlias)
        .onChange(() => this.updatePreview());
      this.input.inputEl.id = inputId;
      this.input.inputEl.addClass('linkr-alias-input');
      this.input.inputEl.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.isComposing) {
          event.preventDefault();
          this.submit();
        }
      });

      const hint = field.createDiv({ cls: 'linkr-field-hint' });
      hint.setText(this.getBlankHint());
    }

    const preview = this.contentEl.createDiv({ cls: 'linkr-preview' });
    preview.createSpan({ cls: 'linkr-preview-label', text: 'Preview' });
    this.previewEl = preview.createEl('code');

    const embedSetting = new Setting(this.contentEl)
      .setName('Embed content')
      .setDesc('Show the linked content inside this note by adding an exclamation mark before the wiki link.')
      .addToggle((toggle) => {
        toggle.setValue(this.embed).onChange((value) => {
          this.embed = value;
          this.updatePreview();
        });
      });
    embedSetting.settingEl.addClass('linkr-embed-setting');

    const actions = this.contentEl.createDiv({ cls: 'linkr-actions' });
    new ButtonComponent(actions).setButtonText('Cancel').onClick(() => this.close());
    new ButtonComponent(actions)
      .setButtonText('Insert link')
      .setCta()
      .onClick(() => this.submit());

    this.contentEl.createDiv({
      cls: 'linkr-shortcut-hint',
      text: 'Enter to insert · Esc or × to cancel',
    });
    addBrandFooter(this.contentEl);
    this.updatePreview();
    if (this.input) {
      window.setTimeout(() => this.input?.inputEl.focus(), 0);
    }
  }

  onClose(): void {
    this.contentEl.empty();
  }

  private getResolvedAlias(): string | null {
    if (!this.request.named) {
      return null;
    }
    const typed = this.input?.getValue().trim() ?? '';
    return typed || this.fallbackAlias;
  }

  private getPlaceholder(): string {
    if (this.fallbackMode === 'none' || this.fallbackAlias === null) {
      return 'Optional link text';
    }
    return `Leave blank for “${this.fallbackAlias}”`;
  }

  private getBlankHint(): string {
    if (this.fallbackMode === 'none' || this.fallbackAlias === null) {
      return 'Blank input inserts the link without | or display text.';
    }
    return `Blank input automatically uses “${this.fallbackAlias}”.`;
  }

  private updatePreview(): void {
    this.previewEl?.setText(
      buildWikiLink(
        this.destinationText,
        { ...this.request, embed: this.embed },
        this.getResolvedAlias(),
      ),
    );
  }

  private submit(): void {
    const alias = this.getResolvedAlias();
    this.close();
    this.onSubmit(alias, this.embed);
  }
}

function addPickerChrome(modal: Modal, title: string, eyebrow: string): void {
  modal.modalEl.addClass('linkr-modal', 'linkr-picker-modal');
  if (!modal.contentEl.querySelector('.linkr-brand')) {
    addBrandHeader(modal.contentEl, title, eyebrow, true);
    addBrandFooter(modal.contentEl);
  }
}

function addBrandHeader(
  container: HTMLElement,
  title: string,
  eyebrow: string,
  prepend = false,
): void {
  const header = createDiv({ cls: 'linkr-brand' });
  const mark = header.createSpan({ cls: 'linkr-brand-mark' });
  setIcon(mark, 'waypoints');
  const copy = header.createDiv({ cls: 'linkr-brand-copy' });
  copy.createDiv({ cls: 'linkr-eyebrow', text: `${eyebrow} · ${BRAND}` });
  copy.createEl('h2', { cls: 'linkr-title', text: title });
  prepend ? container.prepend(header) : container.append(header);
}

function addBrandFooter(container: HTMLElement): void {
  container.createDiv({
    cls: 'linkr-footer',
    text: `Linkr 2.0.2 · crafted by ${BRAND}`,
  });
}

function parentPath(file: TFile): string {
  const slash = file.path.lastIndexOf('/');
  return slash === -1 ? 'Vault root' : file.path.slice(0, slash);
}

function iconForFile(file: TFile): string {
  const extension = file.extension.toLocaleLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif'].includes(extension)) {
    return 'image';
  }
  if (extension === 'pdf') {
    return 'file-text';
  }
  if (['mp3', 'wav', 'm4a', 'ogg', 'flac'].includes(extension)) {
    return 'audio-lines';
  }
  if (['mp4', 'webm', 'mov'].includes(extension)) {
    return 'video';
  }
  return extension === 'md' ? 'file-text' : 'paperclip';
}
