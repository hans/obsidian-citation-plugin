import { App, FileSystemAdapter, MarkdownSourceView, MarkdownView, Plugin, TFile } from 'obsidian';
import { InsertCitationModal, OpenNoteModal } from './modals';

import { CitationsPluginSettings, CitationSettingTab, IIndexable } from './settings';
import { Entry, EntryData } from './types';


export default class CitationPlugin extends Plugin {
	settings: CitationsPluginSettings;
	library: {[id: string]: Entry} = {};

	get editor(): CodeMirror.Editor {
		let view = this.app.workspace.activeLeaf.view;
		if (!(view instanceof MarkdownView))
			return null;

		let sourceView = view.sourceMode;
		return (sourceView as MarkdownSourceView).cmEditor;
	}

	async loadSettings() {
		this.settings = new CitationsPluginSettings();

		const loadedSettings = await this.loadData();
		if (!loadedSettings)
			return;

		const toLoad = ["citationExportPath", "_literatureNoteTitleTemplate",
									  "_literatureNotePathTemplate", "_literatureNoteContentTemplate"]
		toLoad.forEach(setting => {
			if (setting in loadedSettings) {
				(this.settings as IIndexable)[setting] = loadedSettings[setting];
			}
		})
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	onload() {
		this.loadSettings().then(() => this.init());
	}

	init() {
		this.loadLibrary();

		// TODO subscribe to library updates

		this.addCommand({
			id: "open-literature-note",
			name: "Open literature note",
			hotkeys: [
				{modifiers: ["Ctrl", "Shift"], key: "o"},
			],
			callback: () => {
				let modal = new OpenNoteModal(this.app, this);
				modal.open();
			}
		})

		this.addCommand({
			id: "insert-citation",
			name: "Insert citation",
			hotkeys: [
				{modifiers: ["Ctrl", "Shift"], key: "i"},
			],
			callback: () => {
				let modal = new InsertCitationModal(this.app, this);
				modal.open();
			}
		})

		this.addSettingTab(new CitationSettingTab(this.app, this));
	}

	async loadLibrary() {
		if (this.settings.citationExportPath) {
			FileSystemAdapter.readLocalFile(this.settings.citationExportPath).then(buffer => this.onLibraryUpdate(buffer))
		} else {
			console.warn("Citations plugin: citation export path is not set. Please update plugin settings.");
		}
	}

	onLibraryUpdate(libraryBuffer: ArrayBuffer) {
		// Decode file as UTF-8
		var dataView = new DataView(libraryBuffer);
		var decoder = new TextDecoder("utf8");
		const value = decoder.decode(dataView);

		let libraryArray = JSON.parse(value);
		// Index by citekey
		this.library = Object.fromEntries(libraryArray.map((entryData: EntryData) => [entryData.id, new Entry(entryData)]));
	}

	onunload() {
		console.log('unloading plugin');
	}

	getTitleForCitekey(citekey: string): string {
		let entry = this.library[citekey];
		return this.settings.literatureNoteTitleTemplate({
			citekey: citekey,
			title: entry.title,
			authors: entry.authors,
			authorString: entry.authorString,
			year: entry.year
		});
	}

	getPathForCitekey(citekey: string): string {
		let title = this.getTitleForCitekey(citekey);
		return this.settings.literatureNotePathTemplate({noteTitle: title});
	}

	getInitialContentForCitekey(citekey: string): string {
		let entry = this.library[citekey];
		return this.settings.literatureNoteContentTemplate({
			citekey: citekey,
			title: entry.title,
			authors: entry.authors,
			authorString: entry.authorString,
			year: entry.year
		});
	}

	async getOrCreateLiteratureNoteFile(citekey: string): Promise<TFile> {
		let path = this.getPathForCitekey(citekey),
				file = this.app.vault.getAbstractFileByPath(path);

		if (file == null) {
			file = await this.app.vault.create(path, this.getInitialContentForCitekey(citekey));
		}

		return file as TFile;
	}

	async openLiteratureNote(citekey: string, newPane: boolean): Promise<void> {
		this.getOrCreateLiteratureNoteFile(citekey).then((file: TFile) => {
			this.app.workspace.getLeaf(newPane).openFile(file);
		});
	}

	async insertLiteratureNoteLink(citekey: string) {
		this.getOrCreateLiteratureNoteFile(citekey).then(file => {
			// TODO what is the API for this?
			console.log(this.app.workspace.activeLeaf);

			let title = this.getTitleForCitekey(citekey),
				  linkText = `[[${title}]]`;
			// console.log(this.app.metadataCache.fileToLinktext(file, this.app.vault.getRoot().path, true))
			this.editor.replaceRange(linkText, this.editor.getCursor());
		})
	}
}
