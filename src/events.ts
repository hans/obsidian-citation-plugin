/**
 * Defines an event manager for the citations plugin.
 */

import { Events, EventRef } from 'obsidian';

export default class CitationEvents extends Events {
  on(name: 'library-load-start', callback: () => any, ctx?: any): EventRef;
  on(name: 'library-load-complete', callback: () => any, ctx?: any): EventRef;
  on(name: string, callback: (...data: any[]) => any, ctx?: any): EventRef {
    return super.on(name, callback, ctx);
  }

  trigger(name: 'library-load-start'): void;
  trigger(name: 'library-load-complete'): void;
  trigger(name: string, ...data: any[]): void {
    super.trigger(name, data);
  }
}
