import { App, Plugin, PluginManifest } from 'obsidian';

import { CitationPlugin } from '../main';

interface MockedApp extends App {
  initializeWithPlugin: (
    plugin: new (app: App, _: PluginManifest) => Plugin,
  ) => Promise<void>;
}

declare global {
  interface Window {
    app: MockedApp;
  }
}

// jest.mock('../original-fs', () => {
//   const mockedModule = jest.requireActual('fs');
//   return { ...mockedModule };
// });

jest.mock('obsidian', () => {
  const mockedModule = jest.requireActual('../__mocks__/obsidian');
  return { ...mockedModule };
});

beforeEach(() => {
  window.app = new App() as MockedApp;
  window.app.initializeWithPlugin(CitationPlugin);
});
