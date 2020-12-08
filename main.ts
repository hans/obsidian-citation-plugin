import { App, FileSystemAdapter, fuzzySearch, Modal, Notice, Plugin, PluginSettingTab, PreparedQuery, prepareQuery, Setting, SuggestModal, TFile } from 'obsidian';
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
}

export default class MyPlugin extends Plugin {
	library: {[id: string]: Entry} = {};
	index?: Index = null;

	onload() {
		console.log('loading plugin');

		// const q: PreparedQuery = prepareQuery("foo");
		// const text = "this is a test\nstring with foo\n and bar foo";
		// console.log(fuzzySearch(q, text));

		// Load library export
		FileSystemAdapter.readLocalFile(BBT_EXPORT_PATH).then(buffer => this.onLibraryUpdate(buffer))

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

		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onLibraryUpdate(libraryBuffer: ArrayBuffer) {
		// Decode file as UTF-8
		var dataView = new DataView(libraryBuffer);
		var decoder = new TextDecoder("utf8");
		const value = decoder.decode(dataView);

		let libraryArray = JSON.parse(value);
		// Index by bibtex code
		console.log("here", libraryArray.length)
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

		Object.values(this.library).forEach((entry: Entry) => {
			b.add({
				id: entry.id,
				title: entry.title
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
}

class SearchModal extends SuggestModal<Index.Result> {
	plugin: MyPlugin;

  getSuggestions(query: string): Index.Result[] {
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

		this.inputEl.addEventListener("keyup", (ev) => this.onInputKeyup(ev))

		this.setInstructions([
			{command: "↑↓", purpose: "to navigate"},
			{command: "↵", purpose: "to open literature note"},
			{command: "ctrl ↵", purpose: "to open literature note in a new pane"},
			{command: "esc", purpose: "to dismiss"},
		])
	}

	onInputKeyup(ev: KeyboardEvent) {
		// TODO finish
		if (ev.key == "Enter") {
			let newPane = ev.ctrlKey;
			// TODO get the currently selected note
			this.plugin.openLiteratureNote("ab", newPane)
		}
	}
}

class InsertCitationModal extends SearchModal {
	// onChooseSuggestion(value: Index.Result, evt: any): void {
	// 	console.log("chose", value, this.plugin.library[value.ref]);
	// }
}

class SampleSettingTab extends PluginSettingTab {
	display(): void {
		let {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text.setPlaceholder('Enter your secret')
				.setValue('')
				.onChange((value) => {
					console.log('Secret: ' + value);
				}));

	}
}
