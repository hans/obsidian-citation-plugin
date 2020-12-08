import { App, FileSystemAdapter, fuzzySearch, MarkdownSourceView, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, PreparedQuery, prepareQuery, Setting, SuggestModal, TFile } from 'obsidian';
import { Builder, Index } from 'lunr';

// TODO
const BBT_EXPORT_PATH = "/home/jon/Zotero/Meine Bibliothek.json";

// function arrayBufferToString(buffer: ArrayBuffer): string {
// 	// var ret = '';
//   // var bytes = new Uint8Array(buffer);
//   // var len = bytes.byteLength;
//   // for (var i = 0; i < len; i++) {
//   //   ret += String.fromCharCode(bytes[i]);
//   // }
//
// }

interface Author {
	given?: string,
	family?: string
}

interface Entry {
	id: string,
	title?: string,
	author?: Author[],
	issued?: {"date-parts": [any[]]}
}
function getEntryYear(entry: Entry): string {
	if (entry.issued && entry.issued["date-parts"] && entry.issued["date-parts"][0].length > 0)
		return entry.issued["date-parts"][0][0];
	return null;
}


class CitationsPluginSettings {
	public citationExportPath: string;
}


export default class MyPlugin extends Plugin {
	settings: CitationsPluginSettings
	library: {[id: string]: Entry} = {};
	index?: Index = null;

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

		if ("citationExportPath" in loadedSettings)
			this.settings.citationExportPath = loadedSettings.citationExportPath;
	}

	async saveSettings() {
		this.saveData(this.settings);
	}

	onload() {
		this.loadSettings().then(() => this.init());
	}

	init() {
		// Load library export
		if (this.settings.citationExportPath) {
			FileSystemAdapter.readLocalFile(this.settings.citationExportPath).then(buffer => this.onLibraryUpdate(buffer))
		} else {
			console.warn("Citations plugin: citation export path is not set. Please update plugin settings.");
		}

		this.addCommand({
			id: "insert-citation",
			name: "Insert citation",
			checkCallback: (checking: boolean) => {
				if (!checking) {
					let modal = new InsertCitationModal(this.app, this);
					modal.open();
				}
			}
		})

		this.addRibbonIcon("dice", "Sample Plugin", () => {
			new InsertCitationModal(this.app, this).open();
		})

		this.addSettingTab(new CitationsSettingTab(this.app, this));
	}

	onLibraryUpdate(libraryBuffer: ArrayBuffer) {
		// Decode file as UTF-8
		var dataView = new DataView(libraryBuffer);
		var decoder = new TextDecoder("utf8");
		const value = decoder.decode(dataView);

		let libraryArray = JSON.parse(value);
		// Index by citekey
		this.library = Object.fromEntries(libraryArray.map((entry: Entry) => [entry.id, entry]))
		this.rebuildIndex()
	}

	onunload() {
		console.log('unloading plugin');
	}

	rebuildIndex() {
		let b = new Builder();

		b.field("id");
		b.field("title");
		b.field("authors");
		b.field("year");

		Object.values(this.library).forEach((entry: Entry) => {
			b.add({
				id: entry.id,
				title: entry.title,
				authors: entry.author && entry.author.flatMap(a =>
					[a.given, a.family, `${a.given} ${a.family}`]),
				year: getEntryYear(entry)
			})
		})

		this.index = b.build();
	}

	async getOrCreateLiteratureNoteFile(citekey: string): Promise<TFile> {
		let path = `Reading notes/@${citekey}.md`,
				file = this.app.vault.getAbstractFileByPath(path);

		if (file == null)
			file = await this.app.vault.create(path, "");

		return file as TFile;
	}

	async openLiteratureNote(citekey: string, newPane: boolean): Promise<void> {
		this.getOrCreateLiteratureNoteFile(citekey).then((file: TFile) => {
			this.app.workspace.getLeaf(newPane).openFile(file)
		});
	}

	async insertLiteratureNoteLink(citekey: string) {
		this.getOrCreateLiteratureNoteFile(citekey).then(file => {
			// TODO what is the API for this?
			console.log(this.app.workspace.activeLeaf);

			const linkText = `[[@${citekey}]]`;
			this.editor.replaceRange(linkText, this.editor.getCursor());
		})
	}
}

class SearchModal extends SuggestModal<Index.Result> {
	plugin: MyPlugin;
	limit = 50;

  getSuggestions(query: string): Index.Result[] {
		if (query == "")
			return [];
    return this.plugin.index.search(query);
  };

  renderSuggestion(result: Index.Result, el: HTMLElement): void {
		el.empty();
		let entry = this.plugin.library[result.ref];

		let authorText = entry.author ? entry.author.map(a => `${a.given} ${a.family}`).join(", ") : "";

		let container = el.createEl("div", {cls: "zoteroResult"});
		container.createEl("span", {cls: "zoteroTitle", text: entry.title});
		container.createEl("span", {cls: "zoteroCitekey", text: entry.id});
		container.createEl("span", {cls: "zoteroAuthors", text: authorText});
  }

  onChooseSuggestion(item: Index.Result, evt: MouseEvent | KeyboardEvent): void {
    this.plugin.openLiteratureNote(item.ref, false);
  }

	constructor(app: App, plugin: MyPlugin) {
		super(app);
		this.plugin = plugin;

		// this.inputEl.addEventListener("keyup", (ev) => this.onInputKeyup(ev))

		this.setInstructions([
			{command: "↑↓", purpose: "to navigate"},
			{command: "↵", purpose: "to open literature note"},
			{command: "ctrl ↵", purpose: "to open literature note in a new pane"},
			{command: "esc", purpose: "to dismiss"},
		])
	}

	// TODO need to get currently selected note
	// onInputKeyup(ev: KeyboardEvent) {
	// 	if (ev.key == "Enter") {
	// 		let newPane = ev.ctrlKey;
	// 		// TODO get the currently selected note
	// 		this.plugin.openLiteratureNote("ab", newPane)
	// 	}
	// }
}

class OpenNoteModal extends SearchModal {
	onChooseSuggestion(item: Index.Result, evt: MouseEvent | KeyboardEvent): void {
		let newPane = evt instanceof KeyboardEvent && (evt as KeyboardEvent).ctrlKey;
		this.plugin.openLiteratureNote(item.ref, newPane)
	}
}

class InsertCitationModal extends SearchModal {
	onChooseSuggestion(item: Index.Result, evt: any): void {
		this.plugin.insertLiteratureNoteLink(item.ref);
	}
}

class CitationsSettingTab extends PluginSettingTab {

	private plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Citation plugin settings'});

		// new Setting(containerEl)
		// 	.setName("Citation manager")
		// 	.addDropdown(dropdown => dropdown.addOptions({zotero: "Zotero"}));

		new Setting(containerEl)
				.setName("Citation export path")
				.addText(input => input.setPlaceholder("/path/to/export.json")
					.setValue(this.plugin.settings.citationExportPath).onChange(value => {
						this.plugin.settings.citationExportPath = value;
						this.plugin.saveSettings();
						this.display();
					}))
	}
}
