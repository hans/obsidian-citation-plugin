export interface Author {
	given?: string,
	family?: string
}

// Entry data available in JSON export
export interface EntryData {
	id: string,
	title?: string,
	author?: Author[],
	issued?: {"date-parts": [any[]]}
}

export class Entry {

	constructor(private data: EntryData) { }

	get id() { return this.data.id; }
	get title() { return this.data.title; }
	get authors(): Author[] { return this.data.author; }

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
