import { Notice } from 'obsidian';

import PromiseWorker from 'promise-worker';

import { NoticeExt } from './obsidian-extensions';

export const DISALLOWED_FILENAME_CHARACTERS_RE = /[*"\\/<>:|?]/g;

/**
 * Manages a category of notices to be displayed in the UI. Prevents multiple
 * notices being shown at the same time.
 */
export class Notifier {
  static DISAPPEARING_CLASS = 'mod-disappearing';
  currentNotice?: NoticeExt;
  mutationObserver?: MutationObserver;

  constructor(public defaultMessage: string) {}

  unload(): void {
    this.hide();
  }

  /**
   * @returns true if the notice was shown, and false otherwise
   */
  show(message?: string): boolean {
    message = message || this.defaultMessage;
    if (this.currentNotice) return false;

    this.currentNotice = new Notice(message) as NoticeExt;

    // Set up mutation observer to watch for when the notice disappears.
    this.mutationObserver?.disconnect();
    this.mutationObserver = new MutationObserver((changes, observer) => {
      const isDisappearing = changes.some((change) => {
        const el = change.target as HTMLElement;
        return (
          change.type == 'attributes' &&
          el.hasClass(NoticeExt.DISAPPEARING_CLASS)
        );
      });
      if (isDisappearing) {
        this.currentNotice = null;
        observer.disconnect();
        this.mutationObserver = null;
      }
    });
    this.mutationObserver.observe(this.currentNotice.noticeEl, {
      attributeFilter: ['class'],
    });
  }

  hide(): void {
    this.currentNotice?.hide();
    this.mutationObserver?.disconnect();

    this.currentNotice = null;
    this.mutationObserver = null;
  }
}

/**
 * Manages a Worker, recording its state and optionally preventing
 * message postings before responses to prior messages have been received.
 */
export class WorkerManager {
  private worker = new PromiseWorker(this._worker);
  options: WorkerManagerOptions;

  /**
   * Only relevant when `blockingChannel` option is true.
   * Then this property is true iff the worker is currently processing a
   * received message, and has not yet posted a response.
   */
  blocked = false;

  constructor(private _worker: Worker, options: WorkerManagerOptions) {
    this.options = { ...workerManagerDefaultOptions, ...options };
  }

  /**
   * Attempt to post a message to the worker and return a promise response.
   *
   * If `blockingChannel` option is true and the channel is currently blocked,
   * the message will be discarded and an error will be thrown.
   */
  async post<TResult = any, TInput = any>(msg: TInput): Promise<TResult> {
    if (this.options.blockingChannel && this.blocked) {
      throw new WorkerManagerBlocked();
    }

    this.blocked = true;
    return this.worker.postMessage(msg).then(
      (result) => {
        this.blocked = false;
        return result;
      },
      (error) => {
        this.blocked = false;
        throw error;
      },
    );
  }
}

export class WorkerManagerBlocked extends Error {
  constructor() {
    super('WorkerManager: discarded message because channel is blocked');
    Object.setPrototypeOf(this, WorkerManagerBlocked.prototype);
  }
}

export interface WorkerManagerOptions {
  /**
   * If true, treat the worker channel as blocking -- when the worker receives
   * a message, no other messages can be sent until the worker sends a message.
   * Messages which are sent during the blocking period will be discarded.
   */
  blockingChannel: boolean;
}

const workerManagerDefaultOptions: WorkerManagerOptions = {
  blockingChannel: false,
};
