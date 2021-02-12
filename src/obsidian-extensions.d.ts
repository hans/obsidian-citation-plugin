/**
 * Hackily exposes undocumented parts of the Obsidian implementation for our use.
 */

import { Vault } from 'obsidian';

export class VaultExt extends Vault {
  getConfig(key: string): any;
}
