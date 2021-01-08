import { App as OApp, DataAdapter, ListedFiles, Plugin } from 'obsidian';

export class TAbstractFile {}

export class TFile extends TAbstractFile {
  public basename: string;
  public path: string;
}

export class TFolder extends TAbstractFile {
  public children: TAbstractFile[];
  public path: string;
}

export class PluginSettingTab {}
export class Modal {}
export class Notice {}
export function normalizePath(notePath: string): string {
  if (!notePath.startsWith('/')) {
    return `/${notePath}`;
  }
  return notePath;
}
export class Vault {
  static recurseChildren(folder: TFolder, cb: (file: TFile) => void): void {
    folder.children.forEach((file) => {
      if (file instanceof TFile) {
        cb(file);
      } else if (file instanceof TFolder) {
        Vault.recurseChildren(file, cb);
      }
    });
  }
}

export class FuzzySuggestModal<T> {}

export class FileSystemAdapter implements DataAdapter {
  getName(): string {
    return 'mock-fs';
  }
  exists = jest.fn();
  list = jest.fn();
  read = jest.fn();
  readBinary = jest.fn();
  write = jest.fn();
  writeBinary = jest.fn();
  getResourcePath = jest.fn();
  mkdir = jest.fn();
  trashSystem = jest.fn();
  trashLocal = jest.fn();
  rmdir = jest.fn();
  remove = jest.fn();
  rename = jest.fn();
  copy = jest.fn();
  setCtime = jest.fn();
  setMtime = jest.fn();
}

// class PluginManager {
//   manifests: Record<string, any> = {};
//   plugins: Record<string, Plugin> = {};
//
//   constructor(private app: App) {}
//
//   initialize() {
//     // ...
//   }
// }

export class App {
  plugin: Plugin;

  async initializeWithPlugin(plugin: new (app: App) => Plugin): Promise<void> {
    this.initializeWithAdapter(new FileSystemAdapter());

    this.plugin = new plugin(this);
    this.plugin.load();
  }

  async initializeWithAdapter(adapter: DataAdapter): Promise<void> {
    // ...
    // TODO create vault directory, and possibly insert file fixtures
    // ...

    this.plugin.load();
  }
}
