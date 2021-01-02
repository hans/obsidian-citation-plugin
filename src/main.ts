import {
  FileSystemAdapter,
  MarkdownSourceView,
  MarkdownView,
  normalizePath,
  Plugin,
  TFile,
} from 'obsidian';
import { watch } from 'original-fs';
import * as path from 'path';
import * as CodeMirror from 'codemirror';
import {
  InsertCitationModal,
  InsertNoteLinkModal,
  OpenNoteModal,
} from './modals';

import {
  CitationSettingTab,
  CitationsPluginSettings,
} from './settings';
import { Entry, EntryBibLaTeXAdapter, EntryCSLAdapter, IIndexable } from './types';
import {
  DISALLOWED_FILENAME_CHARACTERS_RE,
  formatTemplate,
  Notifier,
} from './util';

export default class CitationPlugin extends Plugin {
  settings: CitationsPluginSettings;
  library: { [id: string]: Entry } = {};

  loadErrorNotifier = new Notifier(
    'Unable to load citations. Please update Citations plugin settings.',
  );
  literatureNoteErrorNotifier = new Notifier(
    'Unable to access literature note. Please check that the literature note folder exists, or update the Citations plugin settings.',
  );

  get editor(): CodeMirror.Editor {
    const view = this.app.workspace.activeLeaf.view;
    if (!(view instanceof MarkdownView)) return null;

    const sourceView = view.sourceMode;
    return (sourceView as MarkdownSourceView).cmEditor;
  }

  async loadSettings(): Promise<void> {
    this.settings = new CitationsPluginSettings();

    const loadedSettings = await this.loadData();
    if (!loadedSettings) return;

    const toLoad = [
      'citationExportPath',
      'literatureNoteTitleTemplate',
      'literatureNoteFolder',
      'literatureNoteContentTemplate',
      'markdownCitationTemplate',
      'alternativeMarkdownCitationTemplate',
    ];
    toLoad.forEach((setting) => {
      if (setting in loadedSettings) {
        (this.settings as IIndexable)[setting] = loadedSettings[setting];
      }
    });
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  onload(): void {
    this.loadSettings().then(() => this.init());
  }

  async init(): Promise<void> {
    if (this.settings.citationExportPath) {
      // Load library for the first time
      this.loadLibrary();

      // Set up a watcher to refresh whenever the export is updated
      //
      // TODO this gets triggered a lot when the library is re-exported, with
      // "evt" always "change". Fine to just wastefully respond every time,
      // from what I can see
      try {
        watch(this.settings.citationExportPath, () => {
          this.loadLibrary();
        });
      } catch {
        this.loadErrorNotifier.show();
      }
    } else {
      // TODO show warning?
    }

    this.addCommand({
      id: 'open-literature-note',
      name: 'Open literature note',
      hotkeys: [{ modifiers: ['Ctrl', 'Shift'], key: 'o' }],
      callback: () => {
        const modal = new OpenNoteModal(this.app, this);
        modal.open();
      },
    });

    this.addCommand({
      id: 'insert-citation',
      name: 'Insert literature note link',
      hotkeys: [{ modifiers: ['Ctrl', 'Shift'], key: 'e' }],
      callback: () => {
        const modal = new InsertNoteLinkModal(this.app, this);
        modal.open();
      },
    });

    this.addCommand({
      id: 'insert-markdown-citation',
      name: 'Insert Markdown citation',
      callback: () => {
        const modal = new InsertCitationModal(this.app, this);
        modal.open();
      },
    });

    this.addSettingTab(new CitationSettingTab(this.app, this));
  }

  /**
   * Resolve a provided library path, allowing for relative paths rooted at
   * the vault directory.
   */
  resolveLibraryPath(rawPath: string): string {
    const vaultRoot =
      this.app.vault.adapter instanceof FileSystemAdapter
        ? this.app.vault.adapter.getBasePath()
        : '/';
    return path.resolve(vaultRoot, rawPath);
  }

  async loadLibrary(): Promise<void> {
    console.debug('Citation plugin: Reloading library');
    if (this.settings.citationExportPath) {
      const filePath = this.resolveLibraryPath(
        this.settings.citationExportPath,
      );
      FileSystemAdapter.readLocalFile(filePath)
        .then((buffer) => {
          // If there is a remaining error message, hide it
          this.loadErrorNotifier.hide();

          this.onLibraryUpdate(buffer);
        })
        .catch(() => this.loadErrorNotifier.show());
    } else {
      console.warn(
        'Citations plugin: citation export path is not set. Please update plugin settings.',
      );
    }
  }

  onLibraryUpdate(libraryBuffer: ArrayBuffer): void {
    // Decode file as UTF-8
    const dataView = new DataView(libraryBuffer);
    const decoder = new TextDecoder('utf8');
    const value = decoder.decode(dataView);

    let libraryArray: object[];
    let adapter: new (data: object) => Entry;

    switch (this.settings.citationExportFormat) {
      case "csl-json":
      libraryArray = JSON.parse(value);
      adapter = EntryCSLAdapter;
      break;

      case "biblatex":
      libraryArray = []; // TODO
      adapter = EntryBibLaTeXAdapter;
      break;
    }

    // Index by citekey
    this.library = Object.fromEntries(
      libraryArray.map((entryData: any) => [
        entryData.id,
        new adapter(entryData),
      ]),
    );
  }

  TEMPLATE_VARIABLES = {
    citekey: 'Unique citekey',
    abstract: '',
    authorString: 'Comma-separated list of author names',
    containerTitle:
      'Title of the container holding the reference (e.g. book title for a book chapter, or the journal title for a journal article)',
    DOI: '',
    page: 'Page or page range',
    title: '',
    URL: '',
    year: 'Publication year',
    zoteroSelectURI: 'URI to open the reference in Zotero',
  };
  getTemplateVariablesForCitekey(citekey: string): Record<string, string> {
    const entry: Entry = this.library[citekey];
    return {
      citekey: citekey,

      abstract: entry.abstract,
      authorString: entry.authorString,
      containerTitle: entry.containerTitle,
      DOI: entry.DOI,
      page: entry.page,
      title: entry.title,
      URL: entry.URL,
      year: entry.year?.toString(),
      zoteroSelectURI: entry.zoteroSelectURI,
    };
  }

  getTitleForCitekey(citekey: string): string {
    const unsafeTitle = formatTemplate(
      this.settings.literatureNoteTitleTemplate,
      this.getTemplateVariablesForCitekey(citekey),
    );
    return unsafeTitle.replace(DISALLOWED_FILENAME_CHARACTERS_RE, '_');
  }

  getPathForCitekey(citekey: string): string {
    const title = this.getTitleForCitekey(citekey);
    // TODO escape note title
    return path.join(this.settings.literatureNoteFolder, `${title}.md`);
  }

  getInitialContentForCitekey(citekey: string): string {
    return formatTemplate(
      this.settings.literatureNoteContentTemplate,
      this.getTemplateVariablesForCitekey(citekey),
    );
  }

  getMarkdownCitationForCitekey(citekey: string): string {
    return formatTemplate(
      this.settings.markdownCitationTemplate,
      this.getTemplateVariablesForCitekey(citekey),
    );
  }

  getAlternativeMarkdownCitationForCitekey(citekey: string): string {
    return formatTemplate(
      this.settings.alternativeMarkdownCitationTemplate,
      this.getTemplateVariablesForCitekey(citekey),
    );
  }

  async getOrCreateLiteratureNoteFile(citekey: string): Promise<TFile> {
    const path = this.getPathForCitekey(citekey);
    let file = this.app.vault.getAbstractFileByPath(normalizePath(path));

    if (file == null) {
      try {
        file = await this.app.vault.create(
          path,
          this.getInitialContentForCitekey(citekey),
        );
      } catch (exc) {
        this.literatureNoteErrorNotifier.show();
        throw exc;
      }
    }

    return file as TFile;
  }

  async openLiteratureNote(citekey: string, newPane: boolean): Promise<void> {
    this.getOrCreateLiteratureNoteFile(citekey)
      .then((file: TFile) => {
        this.app.workspace.getLeaf(newPane).openFile(file);
      })
      .catch(console.error);
  }

  async insertLiteratureNoteLink(citekey: string): Promise<void> {
    this.getOrCreateLiteratureNoteFile(citekey)
      .then(() => {
        // TODO what is the API for this?
        console.log(this.app.workspace.activeLeaf);

        const title = this.getTitleForCitekey(citekey),
          linkText = `[[${title}]]`;
        // console.log(this.app.metadataCache.fileToLinktext(file, this.app.vault.getRoot().path, true))
        this.editor.replaceRange(linkText, this.editor.getCursor());
      })
      .catch(console.error);
  }

  async insertMarkdownCitation(
    citekey: string,
    alternative = false,
  ): Promise<void> {
    const func = alternative
      ? this.getAlternativeMarkdownCitationForCitekey
      : this.getMarkdownCitationForCitekey;
    const citation = func.bind(this)(citekey);

    this.editor.replaceRange(citation, this.editor.getCursor());
  }
}
