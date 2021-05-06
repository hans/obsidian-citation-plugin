import type CitationPlugin from './main';

export default class CitationStatusBarItem {
  statusBarItem: HTMLElement;

  constructor(private plugin: CitationPlugin) {}

  async onload(): Promise<void> {
    this.statusBarItem = this.plugin.addStatusBarItem();
    this.statusBarItem.setText('');
    this.statusBarItem.addEventListener('click', (ev: any) => {
      // TODO doesn't work.
      if (!this.plugin.isLibraryLoading) {
        this.plugin.createCitationsView(this.plugin.app.workspace.activeLeaf);
      }
    });

    this.plugin.registerEvent(
      this.plugin.app.workspace.on('file-open', this.updateCitationCount, this),
    );
    this.plugin.registerEvent(
      this.plugin.app.workspace.on('codemirror', this.setupCodeMirror, this),
    );
  }

  setupCodeMirror(cm: CodeMirror.Editor): void {
    cm.on('change', () => this.updateCitationCount.call(this));
  }

  updateCitationCount(e: any): void {
    if (this.plugin.isLibraryLoading || !this.plugin.library) {
      this.statusBarItem.setText('loading citation database...');
      return;
    }

    const activeLeaf: any = this.plugin.app.workspace.activeLeaf ?? null;
    const data = activeLeaf?.view?.data;

    const citations = data == null ? [] : this.plugin.getCitations(data);
    const label = citations.length == 1 ? 'citation' : 'citations';
    this.statusBarItem.setText(`${citations.length} ${label}`);
  }
}
