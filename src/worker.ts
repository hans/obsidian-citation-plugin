import registerPromiseWorker from 'promise-worker/register';
import * as BibTeXParser from '@retorquere/bibtex-parser';

import {
  DatabaseType,
  Entry,
  EntryData,
  EntryCSLAdapter,
  EntryBibLaTeXAdapter,
  IIndexable,
  Library,
} from './types';

registerPromiseWorker(
  (msg: { databaseRaw: string; databaseType: DatabaseType }): Library => {
    // Decode file as UTF-8.
    let libraryArray: EntryData[];
    let adapter: new (data: EntryData) => Entry;
    let idKey: string;

    if (msg.databaseType == 'csl-json') {
      libraryArray = JSON.parse(msg.databaseRaw);
      adapter = EntryCSLAdapter;
      idKey = 'id';
    } else if (msg.databaseType == 'biblatex') {
      const parsed = BibTeXParser.parse(
        msg.databaseRaw,
      ) as BibTeXParser.Bibliography;
      libraryArray = parsed.entries;
      adapter = EntryBibLaTeXAdapter;
      idKey = 'label';
    }

    return Object.fromEntries(
      libraryArray.map((entryData: EntryData) => [
        (entryData as IIndexable)[idKey],
        new adapter(entryData),
      ]),
    );
  },
);
