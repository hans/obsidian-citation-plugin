/**
 * Hackily exposes undocumented parts of the Obsidian implementation for our use.
 * Also extends some types to make our lives easier.
 */

import { EventRef, Vault, Workspace } from 'obsidian';

export class VaultExt extends Vault {
  getConfig(key: string): any;
}
