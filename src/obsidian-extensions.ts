/**
 * Declares properties and methods which are missing from the Obsidian API.
 */

import { Notice } from 'obsidian';

export class NoticeExt extends Notice {
  static DISAPPEARING_CLASS = 'mod-disappearing';

  noticeEl: HTMLElement;
}
