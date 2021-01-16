import { App, FileView, ItemView, TFile, View, WorkspaceLeaf } from 'obsidian';
import * as _ from 'lodash';

import type CitationPlugin from './main';
import type { Entry } from './types';
import Citations from './ui/Citations.svelte';

export class CitationsView extends ItemView {
  // Leaf corresponding to note file
  private file?: TFile;

  private plugin: CitationPlugin;

  private view: Citations;

  constructor(leaf: WorkspaceLeaf, plugin: CitationPlugin) {
    super(leaf);

    this.plugin = plugin;
  }

  load() {
    this.registerEvent(
      this.app.workspace.on('file-open', this.onFileOpen, this),
    );
    this.registerEvent(this.app.vault.on('create', this.onFileChanged, this));
    this.registerEvent(this.app.vault.on('modify', this.onFileChanged, this));
    this.registerEvent(this.app.vault.on('rename', this.onFileRename, this));
    this.registerEvent(this.app.vault.on('delete', this.onFileDeleted, this));

    console.log('citation view loaded');
  }

  async onOpen() {
    const activeLeaf = this.app.workspace.activeLeaf;
    const activeFile = (activeLeaf?.view as FileView)?.file;

    if (!activeFile) {
      // TODO will this ever happen?
    }

    this.file = activeFile;

    this.view = new Citations({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      target: (this as any).contentEl,
      props: {
        citations: [],
      },
    });

    this.redraw();
  }

  async getCitations(): Promise<[Entry, string[]][]> {
    if (!this.plugin?.library) {
      return [];
    }

    const content = await this.app.vault.cachedRead(this.file);

    // TODO support other citation formats
    const matches = content.matchAll(/^.*\[\[@([^\]]+)\]\].*$/gm);
    const results: [Entry, string][] = [...matches]
      .map((match) => {
        const [line, citekey] = match;
        return [this.plugin.library.entries[citekey], line] as [Entry, string];
      })
      .filter(([entry]) => !!entry);

    const groupedResults = _.groupBy(results, ([entry]) => entry.id);
    return Object.values(groupedResults).map((occurrences) => {
      const entry = occurrences[0][0];
      return [entry, occurrences.map(([, line]) => line)];
    });
  }

  async redraw(): Promise<void> {
    if (this.view) {
      if (this.plugin.isLibraryLoading) {
        this.view.$set({ citations: null, loading: true });
      } else {
        const citations = await this.getCitations();
        console.log(citations);
        this.view.$set({ citations, loading: false });
      }
    }
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
