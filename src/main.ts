import { App, FileSystemAdapter, MarkdownSourceView, MarkdownView, normalizePath, Plugin, TFile } from 'obsidian';
// @ts-ignore
import { watch } from 'original-fs';
import * as path from 'path';
import { InsertCitationModal, OpenNoteModal } from './modals';

import { CitationsPluginSettings, CitationSettingTab, IIndexable } from './settings';
import { Entry, EntryData } from './types';
import { formatTemplate } from './util';


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

		const toLoad = ["citationExportPath", "literatureNoteTitleTemplate",
									  "literatureNoteFolder", "literatureNoteContentTemplate"]
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

	async init() {
		if (this.settings.citationExportPath) {
			// Load library for the first time
			this.loadLibrary();

			// Set up a watcher to refresh whenever the export is updated
			//
			// TODO this gets triggered a lot when the library is re-exported, with
			// "evt" always "change". Fine to just wastefully respond every time,
			// from what I can see
			watch(this.settings.citationExportPath, (evt: string) => {
				this.loadLibrary();
			})
		} else {
			// TODO show warning?
		}
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
				{modifiers: ["Ctrl", "Shift"], key: "e"},
			],
			callback: () => {
				let modal = new InsertCitationModal(this.app, this);
				modal.open();
			}
		})

		this.addSettingTab(new CitationSettingTab(this.app, this));
	}

	async loadLibrary() {
		console.debug("Citation plugin: Reloading library");
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
		return formatTemplate(this.settings.literatureNoteTitleTemplate, {
			citekey: citekey,
			title: entry.title,
			authorString: entry.authorString,
			year: entry.year.toString()
		});
	}

	getPathForCitekey(citekey: string): string {
		let title = this.getTitleForCitekey(citekey);
		// TODO escape note title
		return path.join(this.settings.literatureNoteFolder, `${title}.md`);
	}

	getInitialContentForCitekey(citekey: string): string {
		let entry = this.library[citekey];
		return formatTemplate(this.settings.literatureNoteContentTemplate, {
			citekey: citekey,
			title: entry.title,
			authorString: entry.authorString,
			year: entry.year.toString()
		});
	}

	async getOrCreateLiteratureNoteFile(citekey: string): Promise<TFile> {
		let path = this.getPathForCitekey(citekey),
				file = this.app.vault.getAbstractFileByPath(normalizePath(path));

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

	async openEntryPDF(item: Entry) {
		// Get attachment URL(s)
		let attachments = await this.zoteroRPC("item.attachments", [item.id]);
		console.log(attachments);
	}

	/**
	 * Invoke a method supported by the Better BibTeX JSON RPC.
	 */
	async zoteroRPC(method: string, params: string[]): Promise<any> {
		return ajaxPromise({
			method: "POST",
			url: "http://127.0.0.1:23119/better-bibtex/json-rpc",
			data: {jsonrpc: "2.0", method: method, params: params},
			headers: {"Accept": "application/json"},

			success: (resp: any, req: XMLHttpRequest) => {
				console.log(resp, req);
			},
			error: null, // TODO
		})
	}

}
