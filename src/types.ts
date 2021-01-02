// Trick: allow string indexing onto object properties
export interface IIndexable {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface Author {
  given?: string;
  family?: string;
}

export abstract class Entry {
  abstract id: string;
  abstract type: string;

  abstract abstract?: string;
  abstract author?: Author[];
  abstract authorString?: string;
  abstract containerTitle?: string;
  abstract DOI?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract issuedDate?: Date;
  abstract page?: string;
  abstract title?: string;
  abstract URL?: string;

  get year(): number {
    return this.issuedDate?.getFullYear();
  }

  get zoteroSelectURI(): string {
    return `zotero://select/items/@${this.id}`;
  }
}

export interface EntryDataCSL {
  id: string;
  type: string;

  abstract?: string;
  author?: Author[];
  'container-title'?: string;
  DOI?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  issued?: { 'date-parts': [any[]] };
  page?: string;
  title?: string;
  URL?: string;
}

export class EntryCSLAdapter extends Entry {
  constructor(private data: EntryDataCSL) {
    super();
  }

  get id() {
    return this.data.id;
  }
  get type() {
    return this.data.type;
  }

  get abstract() {
    return this.data.abstract;
  }
  get author() {
    return this.data.author;
  }

  get authorString(): string | null {
    return this.data.author
      ? this.data.author.map((a) => `${a.given} ${a.family}`).join(', ')
      : null;
  }

  get containerTitle() {
    return this.data['container-title'];
  }

  get DOI() {
    return this.data.DOI;
  }

  get issuedDate() {
    if (
      !(
        this.data.issued &&
        this.data.issued['date-parts'] &&
        this.data.issued['date-parts'][0].length > 0
      )
    )
      return null;

    let [year, month, day] = this.data.issued['date-parts'][0];
    return new Date(year, month - 1, day);
  }

  get page() {
    return this.data.page;
  }

  get title() {
    return this.data.title;
  }

  get URL() {
    return this.data.URL;
  }

}

export interface EntryDataBibLaTeX {
  label: string;
  type: string;

  properties: {
    abstract?: string;
    author?: string;
    booktitle?: string;
    date?: string;
    doi?: string;
    eventtitle?: string;
    journaltitle?: string;
    pages?: string;
    shortjournal?: string;
    title?: string;
    shorttitle?: string;
    url?: string;
  };
}

const BIBLATEX_PROPERTY_MAPPING: Record<string, string> = {
  abstract: 'abstract',
  author: 'authorString',
  booktitle: 'containerTitle',
  date: 'issued',
  doi: 'DOI',
  eventtitle: 'event',
  journaltitle: 'containerTitle',
  pages: 'page',
  shortjournal: 'containerTitleShort',
  title: 'title',
  shorttitle: 'titleShort',
  url: 'URL',
};

export class EntryBibLaTeXAdapter extends Entry {

  // Unsupported properties
  author: Author[] = null;

  abstract?: string;
  authorString?: string;
  containerTitle?: string;
  containerTitleShort?: string;
  DOI?: string;
  event?: string;
  issued?: string;
  page?: string;
  title?: string;
  titleShort?: string;
  URL?: string;

  constructor(private data: EntryDataBibLaTeX) {
    super();

    Object.entries(BIBLATEX_PROPERTY_MAPPING).forEach(
      (map: [string, string]) => {
        const [src, tgt] = map;
        if (src in this.data.properties) {
          (this as IIndexable)[tgt] = (this.data.properties as IIndexable)[src];
        }
      },
    );
  }

  get id() { return this.data.label; }
  get type() { return this.data.type; }

  get issuedDate() {
    return this.issued ? new Date(this.issued) : null;
  }

}
