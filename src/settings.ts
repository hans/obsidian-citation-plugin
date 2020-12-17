import { AbstractTextComponent, App, DropdownComponent, FileSystemAdapter, PluginSettingTab, Setting, ValueComponent } from "obsidian";
import CitationPlugin from "./main";

// Trick: allow string indexing onto object properties
export interface IIndexable {
	[key: string]: any;
}

const CITATION_DATABASE_FORMAT_LABELS = {
	"csl-json": "CSL-JSON",
	"biblatex": "BibLaTeX",
}

export class CitationsPluginSettings {
	public citationExportPath: string;
	citationExportFormat: "csl-json" | "biblatex" = "csl-json";

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

	citationPathErrorEl: HTMLElement;
	citationPathSuccessEl: HTMLElement;

	constructor(app: App, plugin: CitationPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	open() {
		super.open();
		this.checkCitationExportPath(this.plugin.settings.citationExportPath)
			.then(() => this.showCitationExportPathSuccess());
	}

	addValueChangeCallback(component: AbstractTextComponent<any> | DropdownComponent,
												 settingsKey: string,
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

	buildValueInput(component: AbstractTextComponent<any> | DropdownComponent, settingsKey: string,
                 cb?: ((value: string) => void)): void {
		component.setValue((this.plugin.settings as IIndexable)[settingsKey]);
		this.addValueChangeCallback(component, settingsKey, cb);
	}

	display(): void {
		let {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Citation plugin settings'});

		new Setting(containerEl)
			.setName("Citation database format")
			.addDropdown((component) =>
				this.buildValueInput(component.addOptions(CITATION_DATABASE_FORMAT_LABELS),
          "citationExportFormat",
          (value) => {
            this.checkCitationExportPath(this.plugin.settings.citationExportPath)
              .then((success) => success && this.plugin.loadLibrary());
          }));

    // NB: we force reload of the library on path change.
		new Setting(containerEl)
				.setName("Citation database path")
				.addText(input => this.buildValueInput(
          input.setPlaceholder("/path/to/export.json"),
          "citationExportPath",
          (value) => {
						this.checkCitationExportPath(value)
							.then((success) => success && this.plugin.loadLibrary());
					}));

		this.citationPathErrorEl = containerEl.createEl(
			"p", {cls: "zoteroSettingCitationPathError d-none",
		        text: "The citation export file cannot be found. Please check the path above."});
		this.citationPathSuccessEl = containerEl.createEl(
			"p", {cls: "zoteroSettingCitationPathSuccess d-none",
		        text: "Loaded library with {{n}} references."});

		new Setting(containerEl)
			.setName("Literature note folder")
			.addText(input => this.buildValueInput(input, "literatureNoteFolder"))
			.setDesc("Save literature note files in this folder within your vault. If empty, notes will be stored in the root directory of the vault.");

		containerEl.createEl("h3", {text: "Literature note settings"});
		containerEl.createEl("p", {text: "The following variables can be used in the title and content templates:"});

		let templateVariableUl = containerEl.createEl("ul", {attr: {id: "citationTemplateVariables"}});
		Object.entries(this.plugin.TEMPLATE_VARIABLES).forEach(variableData => {
			let [key, description] = variableData,
			    templateVariableItem = templateVariableUl.createEl("li"),
					templateVariableItemKey = templateVariableItem.createEl("span", {cls: "text-monospace", text: "{{" + key + "}}"}),
					templateVariableItemDescription = templateVariableItem.createEl("span", {text: description ? ` — ${description}` : ""});
			console.log(variableData, key, description);
		});

		new Setting(containerEl)
			.setName("Literature note title template")
			.addText(input => this.buildValueInput(input, "literatureNoteTitleTemplate"));

		new Setting(containerEl)
			.setName("Literature note content template")
			.addTextArea(input => this.buildValueInput(input, "literatureNoteContentTemplate"));
	}

	/**
	 * Returns true iff the path exists; displays error as a side-effect
	 */
	async checkCitationExportPath(path: string): Promise<boolean> {
		try {
			await FileSystemAdapter.readLocalFile(path);
			this.citationPathErrorEl.addClass("d-none");
		} catch (e) {
			this.citationPathSuccessEl.addClass("d-none");
			this.citationPathErrorEl.removeClass("d-none");
			return false;
		}

		return true;
	}

	showCitationExportPathSuccess() {
		if (!this.plugin.library)
			return;

		const numReferences = Object.keys(this.plugin.library).length;
		this.citationPathSuccessEl.setText(`Loaded library with ${numReferences} references.`);
		this.citationPathSuccessEl.removeClass("d-none");
	}

}
