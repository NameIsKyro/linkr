import {
  App,
  Plugin,
  PluginSettingTab,
  SettingDefinitionItem,
} from 'obsidian';
import type { LinkrSettings } from './types';
import { LINK_OPTIONS } from './types';

export const DEFAULT_SETTINGS: LinkrSettings = {
  aliasFallback: 'destination',
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
        heading: 'Linkr Gen 2',
        cls: 'linkr-settings-hero',
        items: [
          {
            name: 'Universal wiki-link workflows',
            desc: 'Created by @NameIsKyro.',
            searchable: false,
          },
        ],
      },
      {
        type: 'group',
        heading: 'Named links',
        items: [
          {
            name: 'Blank name fallback',
            desc: 'What Linkr inserts after the pipe when the name field is blank.',
            aliases: ['alias', 'display name', 'pipe'],
            control: {
              type: 'dropdown',
              key: 'aliasFallback',
              defaultValue: DEFAULT_SETTINGS.aliasFallback,
              options: {
                destination: 'Heading, block text, or file name',
                file: 'File name',
                empty: 'Keep the alias empty',
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
            name: 'Preferred link type',
            desc: 'This option appears first in the universal link picker.',
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
            name: 'Remember last universal choice',
            desc: 'Move the most recently used universal link type to the top.',
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
            desc: 'Choose how many most-recently selected files are boosted. Set to 0 to disable.',
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
            name: 'Linkr 2.0.1',
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
