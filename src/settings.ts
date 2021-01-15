import {
  AbstractTextComponent,
  App,
  DropdownComponent,
  FileSystemAdapter,
  PluginSettingTab,
  Setting,
} from 'obsidian';

import type CitationPlugin from './main';
import { IIndexable, DatabaseType, TEMPLATE_VARIABLES } from './types';

const CITATION_DATABASE_FORMAT_LABELS: Record<DatabaseType, string> = {
  'csl-json': 'CSL-JSON',
  biblatex: 'BibLaTeX',
};

export class CitationsPluginSettings {
  public citationExportPath: string;
  citationExportFormat: DatabaseType = 'csl-json';

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

  citationPathLoadingEl: HTMLElement;
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

  addValueChangeCallback<T extends HTMLTextAreaElement | HTMLInputElement>(
    component: AbstractTextComponent<T> | DropdownComponent,
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

  buildValueInput<T extends HTMLTextAreaElement | HTMLInputElement>(
    component: AbstractTextComponent<T> | DropdownComponent,
    settingsKey: string,
    cb?: (value: string) => void,
  ): void {
    component.setValue((this.plugin.settings as IIndexable)[settingsKey]);
    this.addValueChangeCallback(component, settingsKey, cb);
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();
    containerEl.setAttr('id', 'zoteroSettingTab');

    containerEl.createEl('h2', { text: 'Citation plugin settings' });

    new Setting(containerEl)
      .setName('Citation database format')
      .addDropdown((component) =>
        this.buildValueInput(
          component.addOptions(CITATION_DATABASE_FORMAT_LABELS),
          'citationExportFormat',
          (value) => {
            this.checkCitationExportPath(
              this.plugin.settings.citationExportPath,
            ).then((success) => {
              if (success) {
                this.citationPathSuccessEl.addClass('d-none');
                this.citationPathLoadingEl.removeClass('d-none');

                this.plugin.loadLibrary().then(() => {
                  this.citationPathLoadingEl.addClass('d-none');
                  this.showCitationExportPathSuccess();
                });
              }
            });
          },
        ),
      );

    // NB: we force reload of the library on path change.
    new Setting(containerEl)
      .setName('Citation database path')
      .setDesc(
        'Path to citation library exported by your reference manager. ' +
          'Can be an absolute path or a path relative to the current vault root folder. ' +
          'Citations will be automatically reloaded whenever this file updates.',
      )
      .addText((input) =>
        this.buildValueInput(
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

    this.citationPathLoadingEl = containerEl.createEl('p', {
      cls: 'zoteroSettingCitationPathLoading d-none',
      text: 'Loading citation database...',
    });
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
      .addText((input) => this.buildValueInput(input, 'literatureNoteFolder'))
      .setDesc(
        'Save literature note files in this folder within your vault. If empty, notes will be stored in the root directory of the vault.',
      );

    containerEl.createEl('h3', { text: 'Template settings' });
    const templateInstructionsEl = containerEl.createEl('p');
    templateInstructionsEl.append(
      createSpan({
        text:
          'The following settings determine how the notes and links created by ' +
          'the plugin will be rendered. You may specify a custom template for ' +
          'each type of content. Templates are interpreted using ',
      }),
    );
    templateInstructionsEl.append(
      createEl('a', {
        text: 'Handlebars',
        href: 'https://handlebarsjs.com/guide/expressions.html',
      }),
    );
    templateInstructionsEl.append(
      createSpan({
        text: ' syntax. You can make reference to the following variables:',
      }),
    );

    const templateVariableUl = containerEl.createEl('ul', {
      attr: { id: 'citationTemplateVariables' },
    });
    Object.entries(TEMPLATE_VARIABLES).forEach((variableData) => {
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

    const templateEntryInstructionsEl = containerEl.createEl('p');
    templateEntryInstructionsEl.append(
      createSpan({ text: 'Advanced users may also refer to the ' }),
      createSpan({ text: '{{entry}}', cls: 'text-monospace' }),
      createSpan({
        text:
          ' variable, which contains the full object representation of the ' +
          'reference as used internally by the plugin. See the ',
      }),
      createEl('a', {
        text: 'plugin documentation',
        href: 'http://www.foldl.me/obsidian-citation-plugin/classes/entry.html',
      }),
      createSpan({ text: " for information on this object's structure." }),
    );

    containerEl.createEl('h3', { text: 'Literature note templates' });

    new Setting(containerEl)
      .setName('Literature note title template')
      .addText((input) =>
        this.buildValueInput(input, 'literatureNoteTitleTemplate'),
      );

    new Setting(containerEl)
      .setName('Literature note content template')
      .addTextArea((input) =>
        this.buildValueInput(input, 'literatureNoteContentTemplate'),
      );

    containerEl.createEl('h3', { text: 'Markdown citation templates' });
    containerEl.createEl('p', {
      text:
        'You can insert Pandoc-style Markdown citations rather than literature notes by using the "Insert Markdown citation" command. The below options allow customization of the Markdown citation format.',
    });

    new Setting(containerEl)
      .setName('Markdown primary citation template')
      .addText((input) =>
        this.buildValueInput(input, 'markdownCitationTemplate'),
      );

    new Setting(containerEl)
      .setName('Markdown secondary citation template')
      .addText((input) =>
        this.buildValueInput(input, 'alternativeMarkdownCitationTemplate'),
      );
  }

  /**
   * Returns true iff the path exists; displays error as a side-effect
   */
  async checkCitationExportPath(filePath: string): Promise<boolean> {
    this.citationPathLoadingEl.addClass('d-none');

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

    this.citationPathSuccessEl.setText(
      `Loaded library with ${this.plugin.library.size} references.`,
    );
    this.citationPathSuccessEl.removeClass('d-none');
  }
}
