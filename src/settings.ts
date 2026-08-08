import {
  App,
  Plugin,
  PluginSettingTab,
  SettingDefinitionItem,
} from 'obsidian';
import type { LinkrSettings } from './types';
import { LINK_OPTIONS } from './types';

export const DEFAULT_SETTINGS: LinkrSettings = {
  aliasFallback: 'target',
  enableWikiLink: true,
  enableFileLinkWithText: true,
  enableHeadingLink: false,
  enableHeadingLinkWithText: true,
  enableBlockLink: false,
  enableBlockLinkWithText: true,
  recentFileLimit: 5,
  recentFilePaths: [],
  showFilePaths: true,
  allowCreateNotes: true,
  addHeadingToNewNotes: true,
  preferredUniversalOption: 'file-plain',
  rememberLastUniversalOption: true,
  lastUniversalOption: '',
};

export interface LinkrSettingsHost extends Plugin {
  settings: LinkrSettings;
  saveSettings(): Promise<void>;
}

export class LinkrSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly linkr: LinkrSettingsHost) {
    super(app, linkr);
  }

  getSettingDefinitions(): SettingDefinitionItem<keyof LinkrSettings>[] {
    return [
      {
        type: 'group',
        heading: 'Linkr',
        cls: 'linkr-settings-hero',
        items: [
          {
            name: 'Fast wiki-link workflows',
            desc: 'Build file, heading, and block links with optional display text and embeds.',
            searchable: false,
          },
        ],
      },
      {
        type: 'group',
        heading: 'Link types',
        items: LINK_OPTIONS.map((option) => ({
          name: option.title,
          desc: `${option.description} Example: ${option.example}`,
          aliases: ['link type', 'command', 'universal picker'],
          control: {
            type: 'toggle',
            key: option.settingKey,
            defaultValue: DEFAULT_SETTINGS[option.settingKey],
          },
        })),
      },
      {
        type: 'group',
        heading: 'Link text',
        items: [
          {
            name: 'When link text is blank',
            desc: 'Choose what Linkr uses after | when you leave the link-text field blank. Typed text always wins.',
            aliases: ['alias', 'display text', 'pipe', 'blank text'],
            control: {
              type: 'dropdown',
              key: 'aliasFallback',
              defaultValue: DEFAULT_SETTINGS.aliasFallback,
              options: {
                target: 'Target name — heading1',
                'file-target': 'File > target — file > heading1',
                file: 'File name — file',
                link: 'Generic text — link',
                none: 'No link text — omit |',
              },
            },
          },
        ],
      },
      {
        type: 'group',
        heading: 'Universal command',
        items: [
          {
            name: 'Recommended hotkey',
            desc: 'Assign Command+Option+/ on macOS or Ctrl+Alt+/ on Windows/Linux in Settings → Hotkeys. Linkr leaves it unassigned to avoid conflicts.',
            searchable: false,
          },
          {
            name: 'Preferred link type',
            desc: 'This enabled option appears first in the link builder.',
            aliases: ['default link type', 'universal picker'],
            control: {
              type: 'dropdown',
              key: 'preferredUniversalOption',
              defaultValue: DEFAULT_SETTINGS.preferredUniversalOption,
              options: Object.fromEntries(
                LINK_OPTIONS.map((option) => [option.id, option.title]),
              ),
            },
          },
          {
            name: 'Remember last choice',
            desc: 'Move the most recently used link type to the top of the link builder.',
            aliases: ['recent link type'],
            control: {
              type: 'toggle',
              key: 'rememberLastUniversalOption',
              defaultValue: DEFAULT_SETTINGS.rememberLastUniversalOption,
            },
          },
        ],
      },
      {
        type: 'group',
        heading: 'File picker',
        items: [
          {
            name: 'Recent files at the top',
            desc: 'Choose how many recently selected files are boosted. Set to 0 to disable.',
            aliases: ['recent files', 'MRU'],
            control: {
              type: 'slider',
              key: 'recentFileLimit',
              defaultValue: DEFAULT_SETTINGS.recentFileLimit,
              min: 0,
              max: 10,
              step: 1,
              displayFormat: (value) => String(value),
            },
          },
          {
            name: 'Show file paths',
            desc: 'Show each file’s folder below its name in the picker.',
            aliases: ['folders', 'paths'],
            control: {
              type: 'toggle',
              key: 'showFilePaths',
              defaultValue: DEFAULT_SETTINGS.showFilePaths,
            },
          },
          {
            name: 'Clear recent files',
            desc: 'Forget Linkr’s recent-file ordering without changing any notes.',
            aliases: ['reset recent files'],
            action: (el) => {
              void this.clearRecentFiles(el);
            },
          },
        ],
      },
      {
        type: 'group',
        heading: 'New notes',
        items: [
          {
            name: 'Create notes from file search',
            desc: 'When no exact file exists, offer to create a Markdown note using Obsidian’s configured new-note location.',
            aliases: ['new note', 'create file'],
            control: {
              type: 'toggle',
              key: 'allowCreateNotes',
              defaultValue: DEFAULT_SETTINGS.allowCreateNotes,
            },
          },
          {
            name: 'Add a title heading',
            desc: 'Start Linkr-created notes with an H1 matching the file name.',
            aliases: ['H1', 'new note title'],
            control: {
              type: 'toggle',
              key: 'addHeadingToNewNotes',
              defaultValue: DEFAULT_SETTINGS.addHeadingToNewNotes,
              disabled: () => !this.linkr.settings.allowCreateNotes,
            },
          },
        ],
      },
      {
        type: 'group',
        cls: 'linkr-settings-footer',
        items: [
          {
            name: 'Linkr 2.0.2',
            desc: 'Crafted by @NameIsKyro.',
            searchable: false,
          },
        ],
      },
    ];
  }

  async setControlValue(key: string, value: unknown): Promise<void> {
    await super.setControlValue(key, value);
    if (key === 'allowCreateNotes') {
      this.refreshDomState();
    }
  }

  private async clearRecentFiles(el: HTMLElement): Promise<void> {
    this.linkr.settings.recentFilePaths = [];
    await this.linkr.saveSettings();
    el.setText('Cleared');
  }
}
