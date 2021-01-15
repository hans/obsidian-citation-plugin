import { App, FileView, ItemView, TFile, View, WorkspaceLeaf } from 'obsidian';
import CitationPlugin from './main';

export class CitationsView extends ItemView {
  // Leaf corresponding to note file
  private file?: TFile;

  private plugin: CitationPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: CitationPlugin) {
    super(leaf);

    this.plugin = plugin;
    console.log('parent', this);
    this.containerEl.createEl('p', { text: 'This is a test' });
  }

  load() {
    this.registerEvent(
      this.app.workspace.on('file-open', this.onFileOpen, this),
    );
    this.registerEvent(
      this.app.vault.on('create', this.onFileChanged, this),
    );
    this.registerEvent(
      this.app.vault.on('modify', this.onFileChanged, this),
    );
    this.registerEvent(
      this.app.vault.on('rename', this.onFileRename, this),
    );
    this.registerEvent(
      this.app.vault.on('delete', this.onFileDeleted, this),
    );

    console.log('citation view loaded');
  }

  async onOpen() {
    const activeLeaf = this.app.workspace.activeLeaf;
    const activeFile = (activeLeaf?.view as FileView).file;

    if (activeFile == null) {
      // TODO will this ever happen?
    }

    this.file = activeFile;

    // this.redraw();
  }

  async getCitations(): Promise<string[]> {
    const content = await this.app.vault.cachedRead(this.file);

    // TODO support other citation formats
    let match = content.matchAll(/\[\[@([^\]]+)\]\]/g),
      matches = [...match];
    console.log('match', matches);
    return matches.map((m) => m[1]);
  }

  async redraw() {
    let citations = await this.getCitations();

    const citationsUl = createEl('ul');
    citations.forEach((c) => citationsUl.append(createEl('li', {text: c})));

    this.containerEl.empty();
    this.containerEl.append(citationsUl);
  }

  getViewType(): string {
    return 'citations';
  }

  getDisplayText(): string {
    return 'Citations';
  }

  onFileOpen(file: TFile) {
    this.file = file;
    this.redraw();
  }

  onFileChanged(file: TFile) {
    this.redraw();
  }

  onFileRename(file: TFile) {}

  onFileDeleted(file: TFile) {}
}
