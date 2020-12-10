import { App, FuzzyMatch, FuzzySuggestModal } from "obsidian";
import CitationPlugin from "./main";
import { Entry } from "./types";


// Stub some methods we know are there..
interface FuzzySuggestModalExt<T> extends FuzzySuggestModal<T> {
	chooser: ChooserExt;
}
interface ChooserExt {
	useSelectedItem(evt: MouseEvent | KeyboardEvent): void;
}


class SearchModal extends FuzzySuggestModal<Entry> {
	plugin: CitationPlugin;
	limit = 50;

	constructor(app: App, plugin: CitationPlugin) {
		super(app);
		this.plugin = plugin;

		this.inputEl.addEventListener("keydown", (ev) => this.onInputKeydown(ev));
		this.inputEl.addEventListener("keyup", (ev) => this.onInputKeyup(ev));
	}

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

    let authorsCls = entry.authors ? "zoteroAuthors" : "zoteroAuthors zoteroAuthorsEmpty";
		container.createEl("span", {cls: authorsCls, text: entry.authorString});
  }

	onInputKeydown(ev: KeyboardEvent) {
		if (ev.key == "Tab") {
			ev.preventDefault();
		}
	}

	onInputKeyup(ev: KeyboardEvent) {
		if (ev.key == "Enter" || ev.key == "Tab") {
			(this as unknown as FuzzySuggestModalExt<Entry>).chooser.useSelectedItem(ev);
		}
	}
}

export class OpenNoteModal extends SearchModal {
  constructor(app: App, plugin: CitationPlugin) {
    super(app, plugin);

    this.setInstructions([
			{command: "↑↓", purpose: "to navigate"},
			{command: "↵", purpose: "to open literature note"},
			{command: "ctrl ↵", purpose: "to open literature note in a new pane"},
			{command: "tab", purpose: "open in Zotero"},
			{command: "esc", purpose: "to dismiss"},
		])
  }

	onChooseItem(item: Entry, evt: MouseEvent | KeyboardEvent): void {
		if (evt instanceof MouseEvent || evt.key == "Enter") {
			let newPane = evt instanceof KeyboardEvent && (evt as KeyboardEvent).ctrlKey;
			this.plugin.openLiteratureNote(item.id, newPane)
		} else if (evt.key == "Tab") {
			open(item.zoteroSelectURI);
		}
	}
}

export class InsertCitationModal extends SearchModal {
  constructor(app: App, plugin: CitationPlugin) {
    super(app, plugin);

    this.setInstructions([
			{command: "↑↓", purpose: "to navigate"},
			{command: "↵", purpose: "to insert literature note reference"},
			{command: "esc", purpose: "to dismiss"},
		])
  }

	onChooseItem(item: Entry, evt: any): void {
		this.plugin.insertLiteratureNoteLink(item.id);
	}
}
