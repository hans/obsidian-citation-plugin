import { AbstractTextComponent, App, PluginSettingTab, Setting } from "obsidian";
import CitationPlugin from "./main";

// Trick: allow string indexing onto object properties
export interface IIndexable {
	[key: string]: any;
}

export class CitationsPluginSettings {
	public citationExportPath: string;

	literatureNoteTitleTemplate: string = "@{{citekey}}";
	literatureNotePathTemplate: string = "Reading notes/{{noteTitle}}.md";
	literatureNoteContentTemplate: string = "";
}


export class CitationSettingTab extends PluginSettingTab {

	private plugin: CitationPlugin;

	constructor(app: App, plugin: CitationPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	addTextChangeCallback(component: AbstractTextComponent<any>, settingsKey: string,
                        cb?: ((value: string) => void)): void {
		component.onChange(async (value) => {
			(this.plugin.settings as IIndexable)[settingsKey] = value;
      this.plugin.saveSettings().then(() => {
        if (cb) {
          cb(value);
        }
      })
		})
	}

	buildTextInput(component: AbstractTextComponent<any>, settingsKey: string,
                 cb?: ((value: string) => void)): void {
		component.setValue((this.plugin.settings as IIndexable)[settingsKey]);
		this.addTextChangeCallback(component, settingsKey, cb);
	}

	display(): void {
		let {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Citation plugin settings'});

    // NB: we force reload of the library on path change.
		new Setting(containerEl)
				.setName("Citation export path")
				.addText(input => this.buildTextInput(
          input.setPlaceholder("/path/to/export.json"),
          "citationExportPath",
          (_) => this.plugin.loadLibrary()));

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
