import { App, FileSystemAdapter, FuzzyMatch, fuzzySearch, FuzzySuggestModal, MarkdownSourceView, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, PreparedQuery, prepareQuery, Setting, SuggestModal, TFile } from 'obsidian';
import { Builder, Index } from 'lunr';

interface Author {
	given?: string,
	family?: string
}

// Entry data available in JSON export
interface EntryData {
	id: string,
	title?: string,
	author?: Author[],
	issued?: {"date-parts": [any[]]}
}

class Entry {

	constructor(private data: EntryData) { }

	get id() { return this.data.id; }
	get title() { return this.data.title; }

	get authorString(): string | null {
		return this.data.author
			? this.data.author.map(a => `${a.given} ${a.family}`).join(", ")
			: null;
	}

	get year(): number | null {
		if (this.data.issued && this.data.issued["date-parts"]
			  && this.data.issued["date-parts"][0].length > 0)
			return this.data.issued["date-parts"][0][0];
		return null;
	}

}


class CitationsPluginSettings {
	public citationExportPath: string;
}


export default class MyPlugin extends Plugin {
	settings: CitationsPluginSettings
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
		this.library = Object.fromEntries(libraryArray.map((entryData: EntryData) => [entryData.id, new Entry(entryData)]));
	}

	onunload() {
		console.log('unloading plugin');
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

class SearchModal extends FuzzySuggestModal<Entry> {
	plugin: MyPlugin;
	limit = 50;

	getItems(): Entry[] {
		return Object.values(this.plugin.library);
	}

	getItemText(item: Entry): string {
		return `${item.title} ${item.authorString} ${item.year}`
	}

	onChooseItem(item: Entry, evt: MouseEvent | KeyboardEvent): void {
		this.plugin.openLiteratureNote(item.id, false);
	}

  renderSuggestion(match: FuzzyMatch<Entry>, el: HTMLElement): void {
		el.empty();
		let entry = match.item;

		let container = el.createEl("div", {cls: "zoteroResult"});
		container.createEl("span", {cls: "zoteroTitle", text: entry.title});
		container.createEl("span", {cls: "zoteroCitekey", text: entry.id});
		container.createEl("span", {cls: "zoteroAuthors", text: entry.authorString});
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
	onChooseItem(item: Entry, evt: MouseEvent | KeyboardEvent): void {
		let newPane = evt instanceof KeyboardEvent && (evt as KeyboardEvent).ctrlKey;
		this.plugin.openLiteratureNote(item.id, newPane)
	}
}

class InsertCitationModal extends SearchModal {
	onChooseItem(item: Entry, evt: any): void {
		this.plugin.insertLiteratureNoteLink(item.id);
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
