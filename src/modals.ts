import { App, FuzzyMatch, FuzzySuggestModal } from 'obsidian';
import CitationPlugin from './main';
import { Entry } from './types';

// Stub some methods we know are there..
interface FuzzySuggestModalExt<T> extends FuzzySuggestModal<T> {
  chooser: ChooserExt;
}
interface ChooserExt {
  useSelectedItem(evt: MouseEvent | KeyboardEvent): void;
}

class SearchModal extends FuzzySuggestModal<Entry> {
  plugin: CitationPlugin;
  limit = 50;

  loadingEl: HTMLElement;
  loadingCheckerHandle: NodeJS.Timeout;
  // How frequently should we check whether the library is still loading?
  loadingCheckInterval = 250;

  constructor(app: App, plugin: CitationPlugin) {
    super(app);
    this.plugin = plugin;

    this.resultContainerEl.addClass('zoteroModalResults');

    this.loadingEl = this.resultContainerEl.parentElement.createEl('div', {
      cls: 'zoteroModalLoading',
    });
    this.loadingEl.createEl('div', { cls: 'zoteroModalLoadingAnimation' });
    this.loadingEl.createEl('p', {
      text: 'Loading citation database. Please wait...',
    });
  }

  onOpen() {
    super.onOpen();

    this.checkLoading();
    this.loadingCheckerHandle = setInterval(() => {
      this.checkLoading();
    }, this.loadingCheckInterval);

    // Don't immediately register keyevent listeners. If the modal was triggered
    // by an "Enter" keystroke (e.g. via the Obsidian command dialog), this event
    // will be received here erroneously.
    setTimeout(() => {
      this.inputEl.addEventListener('keydown', (ev) => this.onInputKeydown(ev));
      this.inputEl.addEventListener('keyup', (ev) => this.onInputKeyup(ev));
    }, 50);
  }

  onClose() {
    if (this.loadingCheckerHandle) {
      clearInterval(this.loadingCheckerHandle);
    }
  }

  /**
   * Check if the library is currently being loaded. If so, display animation
   * and disable input. Otherwise hide animation and enable input.
   */
  checkLoading() {
    if (this.plugin.isLibraryLoading) {
      this.loadingEl.removeClass('d-none');
      this.inputEl.disabled = true;
      this.resultContainerEl.empty();
    } else {
      this.loadingEl.addClass('d-none');
      this.inputEl.disabled = false;
      this.inputEl.focus();
    }
  }

  getItems(): Entry[] {
    if (this.plugin.isLibraryLoading) {
      return [];
    }

    return Object.values(this.plugin.library.entries);
  }

  getItemText(item: Entry): string {
    return `${item.title} ${item.authorString} ${item.year}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChooseItem(item: Entry, evt: MouseEvent | KeyboardEvent): void {
    this.plugin.openLiteratureNote(item.id, false).catch(console.error);
  }

  renderSuggestion(match: FuzzyMatch<Entry>, el: HTMLElement): void {
    el.empty();
    const entry = match.item;

    const container = el.createEl('div', { cls: 'zoteroResult' });
    container.createEl('span', { cls: 'zoteroTitle', text: entry.title });
    container.createEl('span', { cls: 'zoteroCitekey', text: entry.id });

    const authorsCls = entry.authorString
      ? 'zoteroAuthors'
      : 'zoteroAuthors zoteroAuthorsEmpty';
    container.createEl('span', { cls: authorsCls, text: entry.authorString });
  }

  onInputKeydown(ev: KeyboardEvent) {
    if (ev.key == 'Tab') {
      ev.preventDefault();
    }
  }

  onInputKeyup(ev: KeyboardEvent) {
    if (ev.key == 'Enter' || ev.key == 'Tab') {
      ((this as unknown) as FuzzySuggestModalExt<Entry>).chooser.useSelectedItem(
        ev,
      );
    }
  }
}

export class OpenNoteModal extends SearchModal {
  constructor(app: App, plugin: CitationPlugin) {
    super(app, plugin);

    this.setInstructions([
      { command: '↑↓', purpose: 'to navigate' },
      { command: '↵', purpose: 'to open literature note' },
      { command: 'ctrl ↵', purpose: 'to open literature note in a new pane' },
      { command: 'tab', purpose: 'open in Zotero' },
      { command: 'esc', purpose: 'to dismiss' },
    ]);
  }

  onChooseItem(item: Entry, evt: MouseEvent | KeyboardEvent): void {
    if (evt instanceof MouseEvent || evt.key == 'Enter') {
      const newPane =
        evt instanceof KeyboardEvent && (evt as KeyboardEvent).ctrlKey;
      this.plugin.openLiteratureNote(item.id, newPane);
    } else if (evt.key == 'Tab') {
      open(item.zoteroSelectURI);
    }
  }
}

export class InsertNoteLinkModal extends SearchModal {
  constructor(app: App, plugin: CitationPlugin) {
    super(app, plugin);

    this.setInstructions([
      { command: '↑↓', purpose: 'to navigate' },
      { command: '↵', purpose: 'to insert literature note reference' },
      { command: 'esc', purpose: 'to dismiss' },
    ]);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChooseItem(item: Entry, evt: unknown): void {
    this.plugin.insertLiteratureNoteLink(item.id).catch(console.error);
  }
}

export class InsertCitationModal extends SearchModal {
  constructor(app: App, plugin: CitationPlugin) {
    super(app, plugin);

    this.setInstructions([
      { command: '↑↓', purpose: 'to navigate' },
      { command: '↵', purpose: 'to insert Markdown citation' },
      { command: 'shift ↵', purpose: 'to insert secondary Markdown citation' },
      { command: 'esc', purpose: 'to dismiss' },
    ]);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChooseItem(item: Entry, evt: MouseEvent | KeyboardEvent): void {
    const isAlternative = evt instanceof KeyboardEvent && evt.shiftKey;
    this.plugin
      .insertMarkdownCitation(item.id, isAlternative)
      .catch(console.error);
  }
}
