/**
 * Hackily exposes undocumented parts of the Obsidian implementation for our use.
 */

import { Vault, Workspace } from 'obsidian';

export class VaultExt extends Vault {
  getConfig(key: string): any;
}

export class WorkspaceExt extends Workspace {
  ensureSideLeaf(
    viewType: string,
    side: 'left' | 'right',
    shouldSplit?: boolean,
  ): void;
}
