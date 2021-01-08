import * as BibTeXParser from '@retorquere/bibtex-parser';
import { Entry as EntryDataBibLaTeX } from '@retorquere/bibtex-parser';

// Trick: allow string indexing onto object properties
export interface IIndexable {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const databaseTypes = ['csl-json', 'biblatex'] as const;
export type DatabaseType = typeof databaseTypes[number];

export const TEMPLATE_VARIABLES = {
  citekey: 'Unique citekey',
  abstract: '',
  authorString: 'Comma-separated list of author names',
  containerTitle:
    'Title of the container holding the reference (e.g. book title for a book chapter, or the journal title for a journal article)',
  DOI: '',
  page: 'Page or page range',
  title: '',
  URL: '',
  year: 'Publication year',
  zoteroSelectURI: 'URI to open the reference in Zotero',
};

export class Library {
  entries: { [citekey: string]: Entry };

  /**
   * For the given citekey, find the corresponding `Entry` and return a
   * collection of template variable assignments.
   */
  getTemplateVariablesForCitekey(citekey: string): Record<string, string> {
    const entry: Entry = this.entries[citekey];
    return {
      citekey: citekey,

      abstract: entry.abstract,
      authorString: entry.authorString,
      containerTitle: entry.containerTitle,
      DOI: entry.DOI,
      page: entry.page,
      title: entry.title,
      URL: entry.URL,
      year: entry.year?.toString(),
      zoteroSelectURI: entry.zoteroSelectURI,
    };
  }
}

/**
 * Load reference entries from the given raw database data.
 *
 * Returns a list of `EntryData`, which should be wrapped with the relevant
 * adapter and used to instantiate a `Library`.
 */
export function loadEntries(
  databaseRaw: string,
  databaseType: DatabaseType,
): EntryData[] {
  let libraryArray: EntryData[];

  if (databaseType == 'csl-json') {
    libraryArray = JSON.parse(databaseRaw);
  } else if (databaseType == 'biblatex') {
    const parsed = BibTeXParser.parse(databaseRaw) as BibTeXParser.Bibliography;
    libraryArray = parsed.entries;
  }

  return libraryArray;
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

export type EntryData = EntryDataCSL | EntryDataBibLaTeX;

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

const BIBLATEX_PROPERTY_MAPPING: Record<string, string> = {
  abstract: 'abstract',
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

// BibLaTeX parser returns arrays of property values (allowing for repeated
// property entries). For the following fields, just blindly take the first.
const BIBLATEX_PROPERTY_TAKE_FIRST: string[] = [
  'abstract',
  'booktitle',
  'date',
  'doi',
  'eventtitle',
  'journaltitle',
  'pages',
  'shortjournal',
  'title',
  'shorttitle',
  'url',
];

export class EntryBibLaTeXAdapter extends Entry {
  abstract?: string;
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
        if (src in this.data.fields) {
          let val = this.data.fields[src];
          if (src in BIBLATEX_PROPERTY_TAKE_FIRST) {
            val = (val as any[])[0];
          }

          (this as IIndexable)[tgt] = val;
        }
      },
    );
  }

  get id() {
    return this.data.key;
  }
  get type() {
    return this.data.type;
  }

  get authorString() {
    if (this.data.creators.author) {
      const names = this.data.creators.author.map((name) => {
        if (name.literal) return name.literal;
        const parts = [name.firstName, name.prefix, name.lastName, name.suffix];
        // Drop any null parts and join
        return parts.filter((x) => x).join(' ');
      });
      return names.join(', ');
    } else {
      return this.data.fields.author?.join(', ');
    }
  }

  get issuedDate() {
    return this.issued ? new Date(this.issued) : null;
  }

  get author(): Author[] {
    return this.data.creators.author?.map((a) => ({
      given: a.firstName,
      family: a.lastName,
    }));
  }
}
