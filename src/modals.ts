import { App, FuzzyMatch, FuzzySuggestModal } from "obsidian";
import CitationPlugin from "./main";
import { Entry } from "./types";

class SearchModal extends FuzzySuggestModal<Entry> {
	plugin: CitationPlugin;
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

    let authorsCls = entry.authors ? "zoteroAuthors" : "zoteroAuthors zoteroAuthorsEmpty";
		container.createEl("span", {cls: authorsCls, text: entry.authorString});
  }

	constructor(app: App, plugin: CitationPlugin) {
		super(app);
		this.plugin = plugin;

		// this.inputEl.addEventListener("keyup", (ev) => this.onInputKeyup(ev))
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

export class OpenNoteModal extends SearchModal {
  constructor(app: App, plugin: CitationPlugin) {
    super(app, plugin);

    this.setInstructions([
			{command: "↑↓", purpose: "to navigate"},
			{command: "↵", purpose: "to open literature note"},
			// {command: "ctrl ↵", purpose: "to open literature note in a new pane"},
			{command: "esc", purpose: "to dismiss"},
		])
  }

	onChooseItem(item: Entry, evt: MouseEvent | KeyboardEvent): void {
		let newPane = evt instanceof KeyboardEvent && (evt as KeyboardEvent).ctrlKey;
		this.plugin.openLiteratureNote(item.id, newPane)
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
