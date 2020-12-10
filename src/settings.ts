import { AbstractTextComponent, App, PluginSettingTab, Setting } from "obsidian";
import CitationPlugin from "./main";

// Trick: allow string indexing onto object properties
export interface IIndexable {
	[key: string]: any;
}

export class CitationsPluginSettings {
	public citationExportPath: string;

	literatureNoteTitleTemplate: string = "@{{citekey}}";
	literatureNoteFolder: string = "Reading notes";
	literatureNoteContentTemplate: string = "---\n" +
		"title: {{title}}\n" +
		"authors: {{authorString}}\n" +
		"year: {{year}}\n" +
		"---\n\n";
		
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
			.setName("Literature note folder")
			.addText(input => this.buildTextInput(input, "literatureNoteFolder"))
			.setDesc("Save literature note files in this folder within your vault. If empty, notes will be stored in the root directory of the vault.");

		new Setting(containerEl)
			.setName("Literature note content template")
			.addTextArea(input => this.buildTextInput(input, "literatureNoteContentTemplate"))
			.setDesc("Available placeholders: {{citekey}}, {{title}}, {{authorString}}, {{year}}")
	}
}
