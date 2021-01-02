import {
  AbstractTextComponent,
  App,
  FileSystemAdapter,
  PluginSettingTab,
  Setting,
} from 'obsidian';
import CitationPlugin from './main';
import { IIndexable } from './types';

export class CitationsPluginSettings {
  public citationExportPath: string;

  literatureNoteTitleTemplate = '@{{citekey}}';
  literatureNoteFolder = 'Reading notes';
  literatureNoteContentTemplate: string =
    '---\n' +
    'title: {{title}}\n' +
    'authors: {{authorString}}\n' +
    'year: {{year}}\n' +
    '---\n\n';

  markdownCitationTemplate = '[@{{citekey}}]';
  alternativeMarkdownCitationTemplate = '@{{citekey}}';
}

export class CitationSettingTab extends PluginSettingTab {
  private plugin: CitationPlugin;

  citationPathErrorEl: HTMLElement;
  citationPathSuccessEl: HTMLElement;

  constructor(app: App, plugin: CitationPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  open(): void {
    super.open();
    this.checkCitationExportPath(
      this.plugin.settings.citationExportPath,
    ).then(() => this.showCitationExportPathSuccess());
  }

  addTextChangeCallback<T extends HTMLTextAreaElement | HTMLInputElement>(
    component: AbstractTextComponent<T>,
    settingsKey: string,
    cb?: (value: string) => void,
  ): void {
    component.onChange(async (value) => {
      (this.plugin.settings as IIndexable)[settingsKey] = value;
      this.plugin.saveSettings().then(() => {
        if (cb) {
          cb(value);
        }
      });
    });
  }

  buildTextInput<T extends HTMLTextAreaElement | HTMLInputElement>(
    component: AbstractTextComponent<T>,
    settingsKey: string,
    cb?: (value: string) => void,
  ): void {
    component.setValue((this.plugin.settings as IIndexable)[settingsKey]);
    this.addTextChangeCallback(component, settingsKey, cb);
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();
    containerEl.setAttr('id', 'zoteroSettingTab');

    containerEl.createEl('h2', { text: 'Citation plugin settings' });

    // NB: we force reload of the library on path change.
    new Setting(containerEl)
      .setName('Citation export path')
      .setDesc(
        'Path to citation library exported by your reference manager. ' +
          'Can be an absolute path or a path relative to the current vault root folder. ' +
          'Citations will be automatically reloaded whenever this file updates.',
      )
      .addText((input) =>
        this.buildTextInput(
          input.setPlaceholder('/path/to/export.json'),
          'citationExportPath',
          (value) => {
            this.checkCitationExportPath(value).then(
              (success) =>
                success &&
                this.plugin
                  .loadLibrary()
                  .then(() => this.showCitationExportPathSuccess()),
            );
          },
        ),
      );

    this.citationPathErrorEl = containerEl.createEl('p', {
      cls: 'zoteroSettingCitationPathError d-none',
      text:
        'The citation export file cannot be found. Please check the path above.',
    });
    this.citationPathSuccessEl = containerEl.createEl('p', {
      cls: 'zoteroSettingCitationPathSuccess d-none',
      text: 'Loaded library with {{n}} references.',
    });

    new Setting(containerEl)
      .setName('Literature note folder')
      .addText((input) => this.buildTextInput(input, 'literatureNoteFolder'))
      .setDesc(
        'Save literature note files in this folder within your vault. If empty, notes will be stored in the root directory of the vault.',
      );

    containerEl.createEl('h3', { text: 'Literature note settings' });
    containerEl.createEl('p', {
      text:
        'The following variables can be used in the title and content templates:',
    });

    const templateVariableUl = containerEl.createEl('ul', {
      attr: { id: 'citationTemplateVariables' },
    });
    Object.entries(this.plugin.TEMPLATE_VARIABLES).forEach((variableData) => {
      const [key, description] = variableData,
        templateVariableItem = templateVariableUl.createEl('li');

      templateVariableItem.createEl('span', {
        cls: 'text-monospace',
        text: '{{' + key + '}}',
      });

      templateVariableItem.createEl('span', {
        text: description ? ` — ${description}` : '',
      });
    });

    new Setting(containerEl)
      .setName('Literature note title template')
      .addText((input) =>
        this.buildTextInput(input, 'literatureNoteTitleTemplate'),
      );

    new Setting(containerEl)
      .setName('Literature note content template')
      .addTextArea((input) =>
        this.buildTextInput(input, 'literatureNoteContentTemplate'),
      );

    containerEl.createEl('h3', { text: 'Markdown citation settings' });
    containerEl.createEl('p', {
      text:
        'You can insert Pandoc-style Markdown citations rather than literature notes by using the "Insert Markdown citation" command. The below options allow customization of the Markdown citation format.',
    });

    new Setting(containerEl)
      .setName('Markdown primary citation template')
      .addText((input) =>
        this.buildTextInput(input, 'markdownCitationTemplate'),
      );

    new Setting(containerEl)
      .setName('Markdown secondary citation template')
      .addText((input) =>
        this.buildTextInput(input, 'alternativeMarkdownCitationTemplate'),
      );
  }

  /**
   * Returns true iff the path exists; displays error as a side-effect
   */
  async checkCitationExportPath(filePath: string): Promise<boolean> {
    try {
      await FileSystemAdapter.readLocalFile(
        this.plugin.resolveLibraryPath(filePath),
      );
      this.citationPathErrorEl.addClass('d-none');
    } catch (e) {
      this.citationPathSuccessEl.addClass('d-none');
      this.citationPathErrorEl.removeClass('d-none');
      return false;
    }

    return true;
  }

  showCitationExportPathSuccess(): void {
    if (!this.plugin.library) return;

    const numReferences = Object.keys(this.plugin.library).length;
    this.citationPathSuccessEl.setText(
      `Loaded library with ${numReferences} references.`,
    );
    this.citationPathSuccessEl.removeClass('d-none');
  }
}
