import { IIndexable } from "./settings";

export interface Author {
	given?: string,
	family?: string
}

// Entry data available in CSL JSON export
export interface EntryData {
	id: string,
	type: string,

	abstract?: string,
	author?: Author[],
  _authorString?: string,
	"container-title"?: string,
	DOI?: string,
  event?: string,
	issued?: {"date-parts": [any[]]} | string,
	page?: string,
	title?: string,
  "title-short"?: string,
	URL?: string,
}

// Entry data available in BibLaTeX export
export interface EntryBibLaTeXData {
  label: string,
  type: string,

  properties: {
    abstract?: string,
    author?: string,
    booktitle?: string,
    date?: string,
    doi?: string,
    eventtitle?: string,
    journaltitle?: string,
    pages?: string,
    shortjournal?: string,
    title?: string,
    shorttitle?: string,
    url?: string,
  }
}
const BIBLATEX_CSL_PROPERTY_MAPPING: Record<string, string> = {
  abstract: "abstract",
  author: "_authorString",
  booktitle: "container-title",
  date: "issued",
  doi: "DOI",
  eventtitle: "event",
  journaltitle: "container-title",
  pages: "page",
  shortjournal: "container-title-short",
  title: "title",
  shorttitle: "title-short",
  url: "URL",
}

export class Entry {

  data: EntryData;
  issuedDate?: Date;

	constructor(data: any, format: "csl-json" | "biblatex" = "csl-json") {
    if (format == "csl-json") {
      this.data = data;

      if (typeof data.issued == "object") {
        let [year, month, day] = data.issued["date-parts"][0];
        this.issuedDate = new Date(year, month - 1, day);
      } else if (typeof data.issued == "string") {
        this.issuedDate = new Date(data.issued);
      }
    } else if (format == "biblatex") {
      this.data = {id: data.label, type: data.type};
      Object.entries(BIBLATEX_CSL_PROPERTY_MAPPING).forEach((map) => {
        let [src, tgt] = map;
        if (src in data) {
          (this.data as IIndexable)[tgt] = data[src];
        }
      });
    }
  }

	get id() { return this.data.id; }

	get abstract(): string { return this.data.abstract; }
	get authors(): Author[] { return this.data.author; }
	get containerTitle(): string { return this.data["container-title"]; }
  get event(): string { return this.data["event"]; }
	get DOI(): string { return this.data.DOI; }
	get page(): string { return this.data.page; }
	get title(): string { return this.data.title; }
	get type(): string { return this.data.type; }
	get URL(): string { return this.data.URL; }

	get authorString(): string | null {
    if (this.data._authorString)
      return this.data._authorString;

		return this.data.author
			? this.data.author.map(a => `${a.given} ${a.family}`).join(", ")
			: null;
	}

	get year(): number | null {
		return this.issuedDate?.getFullYear();
	}

	get zoteroSelectURI(): string {
		return `zotero://select/items/@${this.id}`;
	}

}
