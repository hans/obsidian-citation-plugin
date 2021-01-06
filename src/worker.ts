import registerPromiseWorker from 'promise-worker/register';
import * as BibTeXParser from '@retorquere/bibtex-parser';

import { DatabaseType, EntryData } from './types';

registerPromiseWorker(
  (msg: { databaseRaw: string; databaseType: DatabaseType }): EntryData[] => {
    // Decode file as UTF-8.
    let libraryArray: EntryData[];

    if (msg.databaseType == 'csl-json') {
      libraryArray = JSON.parse(msg.databaseRaw);
    } else if (msg.databaseType == 'biblatex') {
      const parsed = BibTeXParser.parse(
        msg.databaseRaw,
      ) as BibTeXParser.Bibliography;
      libraryArray = parsed.entries;
    }

    return libraryArray;
  },
);
