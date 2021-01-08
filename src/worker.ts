import registerPromiseWorker from 'promise-worker/register';

import { DatabaseType, EntryData, loadEntries } from './types';

registerPromiseWorker(
  (msg: { databaseRaw: string; databaseType: DatabaseType }): EntryData[] => {
    return loadEntries(msg.databaseRaw, msg.databaseType);
  },
);
