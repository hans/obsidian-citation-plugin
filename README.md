# obsidian-citation-plugin

This plugin for [Obsidian](https://obsidian.md) integrates your academic reference manager with the Obsidian editing experience.

![](docs/screenshot.png)

The plugin supports reading bibliographies in [CSL-JSON format][1].

## Setup

You can install this plugin via the Obsidian "Third-party plugin interface." It requires Obsidian 0.9.20 or higher.

Once the plugin is installed, you must provide it with a bibliography file:

- If you use **Zotero** with [Better BibTeX][2]:
  - Select a collection in Zotero's left sidebar that you want to export.
  - Click `File` -> `Export library ...`. Select `Better CSL JSON` as the format. You can optionally choose "Keep updated" to automatically re-export the collection -- this is recommended!
- If you use other reference managers, check their documentation for CSL-JSON export support. We plan to officially support other managers in the future.

Now open the Obsidian preferences and view the "Citations" tab. Paste the path to the JSON export in the text field labeled "Citation export path." After closing the settings dialog, you should now be able to search your references from Zotero!

## Usage

The plugin offers two simple features at the moment:

1. **Open literature note** (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>O</kbd>): automatically create or open a literature note for a particular reference. The title, folder, and initial content of the note can be configured in the plugin settings.
2. **Insert literature note reference** (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>E</kbd>): insert a link to the literature note corresponding to a particular reference.

## License

MIT License.

## Contributors

- Jon Gauthier ([hans](https://github.com/hans))
- [raineszm](https://github.com/raineszm)

[1]: https://github.com/citation-style-language/schema#csl-json-schema
[2]: https://retorque.re/zotero-better-bibtex/
