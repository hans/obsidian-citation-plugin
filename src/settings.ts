import * as Handlebars from "handlebars";
import { AbstractTextComponent, App, PluginSettingTab, Setting } from "obsidian";
import MyPlugin from "./main";

// Trick: allow string indexing onto object properties
export interface IIndexable {
	[key: string]: any;
}

export class CitationsPluginSettings {
	public citationExportPath: string;

	_literatureNoteTitleTemplate: string = "@{{citekey}}";
	_literatureNotePathTemplate: string = "Reading notes/{{noteTitle}}.md";
	_literatureNoteContentTemplate: string = "{{zoteroSelectLink}}";

  get literatureNoteTitleTemplate() {
    return Handlebars.compile(this._literatureNoteTitleTemplate);
  }

  get literatureNotePathTemplate() {
    return Handlebars.compile(this._literatureNotePathTemplate);
  }

  get literatureNoteContentTemplate() {
    return Handlebars.compile(this._literatureNoteContentTemplate);
  }
}


export class CitationsSettingTab extends PluginSettingTab {

	private plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	addTextChangeCallback(component: AbstractTextComponent<any>, settingsKey: string): void {
		component.onChange(async (value) => {
			(this.plugin.settings as IIndexable)[settingsKey] = value;
			this.plugin.saveSettings();
		})
	}

	buildTextInput(component: AbstractTextComponent<any>, settingsKey: string): void {
		component.setValue((this.plugin.settings as IIndexable)[settingsKey]);
		this.addTextChangeCallback(component, settingsKey);
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
				.addText(input => this.buildTextInput(input.setPlaceholder("/path/to/export.json"), "citationExportPath"));

		containerEl.createEl("h3", {text: "Literature note settings"});

		new Setting(containerEl)
			.setName("Literature note title template")
			.addText(input => this.buildTextInput(input, "_literatureNoteTitleTemplate"))
			.setDesc("Available placeholders: {{citekey}}, {{title}}, {{authorString}}, {{year}}")

		new Setting(containerEl)
			.setName("Literature note path template")
			.addText(input => this.buildTextInput(input, "_literatureNotePathTemplate"))
			.setDesc("Available placeholders: {{noteTitle}}");

		new Setting(containerEl)
			.setName("Literature note content template")
			.addTextArea(input => this.buildTextInput(input, "_literatureNoteContentTemplate"))
			.setDesc("Available placeholders: {{citekey}}, {{title}}, {{authorString}}, {{year}}")
	}
}
