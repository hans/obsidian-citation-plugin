import * as fs from 'fs';
import * as path from 'path';

import CitationService from '../citation-service';
import {
  Library,
  Entry,
  EntryData,
  EntryDataBibLaTeX,
  EntryDataCSL,
  EntryBibLaTeXAdapter,
  EntryCSLAdapter,
  loadEntries,
} from '../types';

describe('render biblatex citation', () => {
  let library: Library;
  let svc: CitationService;
  beforeEach(() => {
    const biblatexPath = path.join(__dirname, 'library.bib');
    const biblatex = fs.readFileSync(biblatexPath, 'utf-8');
    const entries = loadEntries(biblatex, 'biblatex') as EntryDataBibLaTeX[];
    library = new Library(
      Object.fromEntries(
        entries.map((e) => [e.key, new EntryBibLaTeXAdapter(e)]),
      ),
    );

    svc = new CitationService();
    svc.library = library;
  });

  test('renders', () => {
    expect(svc.getCitation('alexandrescu2006factored')).toBe(
      '(Alexandrescu and Kirchhoff 2006)',
    );

    const [opts, bib] = svc.getBibliography([
      'alexandrescu2006factored',
      'abnar2019blackbox',
    ]);
    expect(bib).toStrictEqual([
      '  <div class="csl-entry">Abnar, Samira, Lisa Beinborn, Rochelle Choenni, and Willem Zuidema. 2019. “Blackbox Meets Blackbox: Representational Similarity and Stability Analysis of Neural Language Models and Brains.” <i>Arxiv:1906.01539 [Cs, q-Bio]</i>. http://arxiv.org/abs/1906.01539.</div>\n',
      '  <div class="csl-entry">Alexandrescu, Andrei, and Katrin Kirchhoff. 2006. “Factored Neural Language Models.” Association for Computational Linguistics. http://aclasb.dfki.de/nlp/bib/N06-2001.</div>\n',
    ]);
  });
});
