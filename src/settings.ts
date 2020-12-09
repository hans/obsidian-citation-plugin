import { AbstractTextComponent, App, PluginSettingTab, Setting } from "obsidian";
import MyPlugin from "./main";

// Trick: allow string indexing onto object properties
export interface IIndexable {
	[key: string]: any;
}

export class CitationsPluginSettings {
	public citationExportPath: string;

	public literatureNoteTitleTemplate: string = "@{{citekey}}";
	public literatureNotePathTemplate: string = "Reading notes/{{noteTitle}}";
	public literatureNoteContentTemplate: string = "{{zoteroSelectLink}}";

}


export class CitationsSettingTab extends PluginSettingTab {

	private plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	addTextChangeCallback(component: AbstractTextComponent<any>, settingsKey: string): void {
		component.onChange((value) => {
			(this.plugin.settings as IIndexable)[settingsKey] = value;
			this.plugin.saveSettings();
			this.display();
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
			.addText(input => this.buildTextInput(input, "literatureNoteTitleTemplate"))
			.setDesc("Available placeholders: {{citekey}}, {{title}}, {{authorString}}, {{year}}")

		new Setting(containerEl)
			.setName("Literature note path template")
			.addText(input => this.buildTextInput(input, "literatureNotePathTemplate"))
			.setDesc("Available placeholders: {{noteTitle}}");

		new Setting(containerEl)
			.setName("Literature note content template")
			.addTextArea(input => this.buildTextInput(input, "literatureNoteContentTemplate"))
			.setDesc("Available placeholders: {{citekey}}, {{title}}, {{authorString}}, {{year}}")
	}
}
