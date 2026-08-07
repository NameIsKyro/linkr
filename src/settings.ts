import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
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

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass('linkr-settings');

    const hero = containerEl.createDiv({ cls: 'linkr-settings-hero' });
    hero.createEl('h2', { text: 'Linkr Gen 2' });
    hero.createEl('p', {
      text: 'Universal wiki-link workflows, crafted by @NameIsKyro.',
    });

    new Setting(containerEl).setName('Named links').setHeading();

    new Setting(containerEl)
      .setName('Blank name fallback')
      .setDesc('What Linkr inserts after the pipe when the name field is blank.')
      .addDropdown((dropdown) => {
        dropdown
          .addOption('destination', 'Heading, block text, or file name')
          .addOption('file', 'File name')
          .addOption('empty', 'Keep the alias empty')
          .setValue(this.linkr.settings.aliasFallback)
          .onChange(async (value) => {
            this.linkr.settings.aliasFallback = value as LinkrSettings['aliasFallback'];
            await this.linkr.saveSettings();
          });
      });

    new Setting(containerEl).setName('Universal command').setHeading();

    new Setting(containerEl)
      .setName('Preferred link type')
      .setDesc('This option appears first in the universal link picker.')
      .addDropdown((dropdown) => {
        for (const option of LINK_OPTIONS) {
          dropdown.addOption(option.id, option.title);
        }
        dropdown
          .setValue(this.linkr.settings.preferredUniversalOption)
          .onChange(async (value) => {
            this.linkr.settings.preferredUniversalOption = value;
            await this.linkr.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Remember last universal choice')
      .setDesc('Move the most recently used universal link type to the top.')
      .addToggle((toggle) => {
        toggle
          .setValue(this.linkr.settings.rememberLastUniversalOption)
          .onChange(async (value) => {
            this.linkr.settings.rememberLastUniversalOption = value;
            await this.linkr.saveSettings();
          });
      });

    new Setting(containerEl).setName('File picker').setHeading();

    new Setting(containerEl)
      .setName('Recent files at the top')
      .setDesc('Choose how many most-recently selected files are boosted. Set to 0 to disable.')
      .addSlider((slider) => {
        slider
          .setLimits(0, 10, 1)
          .setValue(this.linkr.settings.recentFileLimit)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.linkr.settings.recentFileLimit = value;
            await this.linkr.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Show file paths')
      .setDesc('Show each file’s folder below its name in the picker.')
      .addToggle((toggle) => {
        toggle.setValue(this.linkr.settings.showFilePaths).onChange(async (value) => {
          this.linkr.settings.showFilePaths = value;
          await this.linkr.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName('Clear recent files')
      .setDesc('Forget Linkr’s recent-file ordering without changing any notes.')
      .addButton((button) => {
        button.setButtonText('Clear').onClick(async () => {
          this.linkr.settings.recentFilePaths = [];
          await this.linkr.saveSettings();
          button.setButtonText('Cleared');
        });
      });

    new Setting(containerEl).setName('New notes').setHeading();

    new Setting(containerEl)
      .setName('Create notes from file search')
      .setDesc('When no exact file exists, offer to create a Markdown note using Obsidian’s configured new-note location.')
      .addToggle((toggle) => {
        toggle.setValue(this.linkr.settings.allowCreateNotes).onChange(async (value) => {
          this.linkr.settings.allowCreateNotes = value;
          await this.linkr.saveSettings();
          this.display();
        });
      });

    new Setting(containerEl)
      .setName('Add a title heading')
      .setDesc('Start Linkr-created notes with an H1 matching the file name.')
      .setDisabled(!this.linkr.settings.allowCreateNotes)
      .addToggle((toggle) => {
        toggle
          .setValue(this.linkr.settings.addHeadingToNewNotes)
          .setDisabled(!this.linkr.settings.allowCreateNotes)
          .onChange(async (value) => {
            this.linkr.settings.addHeadingToNewNotes = value;
            await this.linkr.saveSettings();
          });
      });

    containerEl.createDiv({
      cls: 'linkr-settings-footer',
      text: 'Linkr 2.0.0 · @NameIsKyro',
    });
  }
}
