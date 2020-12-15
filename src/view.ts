import { App, FileView, ItemView, TFile, View, WorkspaceLeaf } from "obsidian";
import CitationPlugin from "./main";


export class CitationsView extends ItemView {

  // Leaf corresponding to note file
  private referenceLeaf: WorkspaceLeaf;
  private file?: TFile;

  private plugin: CitationPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: CitationPlugin) {
    super(leaf);

    this.plugin = plugin;
    console.log("parent", this);
    this.containerEl.createEl("p", {text: "This is a test"});
  }

  async onOpen() {
    const activeLeaf = this.app.workspace.activeLeaf;
    const activeFile = (activeLeaf?.view as FileView).file

    if (activeFile == null) {
      // TODO will this ever happen?
    }

    this.referenceLeaf = activeLeaf;
    this.file = activeFile;

    console.log("referenceLeaf", activeLeaf);

    this.redraw();
  }

  getCitations(): string[] {
    console.log("my plugin", this);
    console.log(this.plugin.editor);
    const editorContent = this.plugin.editor?.getValue();
    if (!editorContent) { return []; }

    // TODO support other citation formats
    let match = editorContent.matchAll(/\[\[@([^\]]+)\]\]/g),
        matches = [...match];
    console.log("match", matches);
    return [];
  }

  async redraw() {
    let citations = this.getCitations();
  }

  getViewType(): string {
    return "citations";
  }

  getDisplayText(): string {
    console.log("state", this.getState());
    // TODO how to get title of associated file?
    return "Citations";
  }

}
