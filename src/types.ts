export interface Author {
	given?: string,
	family?: string
}

// Entry data available in JSON export
export interface EntryData {
	id: string,
	type: string,

	abstract?: string,
	author?: Author[],
	"container-title"?: string,
	DOI?: string,
	issued?: {"date-parts": [any[]]},
	page?: string,
	title?: string,
	URL?: string,
}

export class Entry {

	constructor(private data: EntryData) { }

	get id() { return this.data.id; }

	get abstract(): string { return this.data.abstract; }
	get authors(): Author[] { return this.data.author; }
	get containerTitle(): string { return this.data["container-title"]; }
	get DOI(): string { return this.data.DOI; }
	get page(): string { return this.data.page; }
	get title(): string { return this.data.title; }
	get type(): string { return this.data.type; }
	get URL(): string { return this.data.URL; }

	get authorString(): string | null {
		return this.data.author
			? this.data.author.map(a => `${a.given} ${a.family}`).join(", ")
			: null;
	}

	get year(): number | null {
		if (this.data.issued && this.data.issued["date-parts"]
			  && this.data.issued["date-parts"][0].length > 0)
			return this.data.issued["date-parts"][0][0];
		return null;
	}

	get zoteroSelectURI(): string {
		return `zotero://select/items/@${this.id}`;
	}

}
