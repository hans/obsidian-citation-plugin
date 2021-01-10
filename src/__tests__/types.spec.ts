import * as fs from 'fs';
import * as path from 'path';

import * as _ from 'lodash';

import {
  Library,
  EntryData,
  EntryDataBibLaTeX,
  EntryDataCSL,
  EntryBibLaTeXAdapter,
  EntryCSLAdapter,
  loadEntries,
} from '../types';

const expectedRender: Record<string, string>[] = [
  {
    citekey: 'abnar2019blackbox',
    abstract:
      'In this paper, we define and apply representational stability analysis (ReStA), an intuitive way of analyzing neural language models. ReStA is a variant of the popular representational similarity analysis (RSA) in cognitive neuroscience. While RSA can be used to compare representations in models, model components, and human brains, ReStA compares instances of the same model, while systematically varying single model parameter. Using ReStA, we study four recent and successful neural language models, and evaluate how sensitive their internal representations are to the amount of prior context. Using RSA, we perform a systematic study of how similar the representational spaces in the first and second (or higher) layers of these models are to each other and to patterns of activation in the human brain. Our results reveal surprisingly strong differences between language models, and give insights into where the deep linguistic processing, that integrates information over multiple sentences, is happening in these models. The combination of ReStA and RSA on models and brains allows us to start addressing the important question of what kind of linguistic processes we can hope to observe in fMRI brain imaging data. In particular, our results suggest that the data on story reading from Wehbe et al. (2014) contains a signal of shallow linguistic processing, but show no evidence on the more interesting deep linguistic processing.',
    authorString:
      'Samira Abnar, Lisa Beinborn, Rochelle Choenni, Willem Zuidema',
    containerTitle: 'arxiv:1906.01539 [cs, q-bio]',
    DOI: undefined,
    page: undefined,
    title:
      'Blackbox meets blackbox: Representational Similarity and Stability Analysis of Neural Language Models and Brains',
    URL: 'http://arxiv.org/abs/1906.01539',
    year: '2019',
    zoteroSelectURI: 'zotero://select/items/@abnar2019blackbox',
  },
  {
    citekey: 'aitchison2017you',
    abstract:
      'Two theoretical ideas have emerged recently with the ambition to provide a unifying functional explanation of neural population coding and dynamics: predictive coding and Bayesian inference. Here, we describe the two theories and their combination into a single framework: Bayesian predictive coding. We clarify how the two theories can be distinguished, despite sharing core computational concepts and addressing an overlapping set of empirical phenomena. We argue that predictive coding is an algorithmic/representational motif that can serve several different computational goals of which Bayesian inference is but one. Conversely, while Bayesian inference can utilize predictive coding, it can also be realized by a variety of other representations. We critically evaluate the experimental evidence supporting Bayesian predictive coding and discuss how to test it more directly.',
    authorString: 'Laurence Aitchison, Máté Lengyel',
    containerTitle: 'Current Opinion in Neurobiology',
    DOI: '10.1016/j.conb.2017.08.010',
    page: '219–227',
    title:
      'With or without you: Predictive coding and Bayesian inference in the brain',
    URL: 'http://www.sciencedirect.com/science/article/pii/S0959438817300454',
    year: '2017',
    zoteroSelectURI: 'zotero://select/items/@aitchison2017you',
  },
  {
    citekey: 'alexandrescu2006factored',
    abstract: undefined,
    authorString: 'Andrei Alexandrescu, Katrin Kirchhoff',
    containerTitle: undefined,
    DOI: undefined,
    page: '1–4',
    title: 'Factored Neural Language Models',
    URL: 'http://aclasb.dfki.de/nlp/bib/N06-2001',
    year: '2006',
    zoteroSelectURI: 'zotero://select/items/@alexandrescu2006factored',
  },
  {
    citekey: 'bar-ashersiegal2020perspectives',
    abstract: undefined,
    authorString: undefined,
    containerTitle: undefined,
    DOI: '10.1007/978-3-030-34308-8',
    page: undefined,
    title:
      'Perspectives on Causation: Selected Papers from the Jerusalem 2017 Workshop',
    URL: 'http://link.springer.com/10.1007/978-3-030-34308-8',
    year: '2020',
    zoteroSelectURI: 'zotero://select/items/@bar-ashersiegal2020perspectives',
  },
];

// Test whether loaded and expected libraries are the same, ignoring casing and
// hyphenation
function matchLibraryRender(
  actual: Record<string, string>[],
  expected: Record<string, string>[],
): void {
  const transform = (val: string) =>
    val?.toLowerCase().replace(/[\u2012-\u2014]/g, '-');

  actual = actual.map((r) => _.mapValues(r, transform));
  expected = expected.map((r) => _.mapValues(r, transform));

  expect(actual).toMatchObject(expected);
}

function loadBibLaTeXEntries(filename: string): EntryDataBibLaTeX[] {
  const biblatexPath = path.join(__dirname, filename);
  const biblatex = fs.readFileSync(biblatexPath, 'utf-8');
  return loadEntries(biblatex, 'biblatex') as EntryDataBibLaTeX[];
}

function loadBibLaTeXLibrary(entries: EntryDataBibLaTeX[]): Library {
  return new Library(
    Object.fromEntries(
      entries.map((e: EntryDataBibLaTeX) => [
        e.key,
        new EntryBibLaTeXAdapter(e),
      ]),
    ),
  );
}

describe('biblatex library', () => {
  let entries: EntryDataBibLaTeX[];
  beforeEach(() => {
    entries = loadBibLaTeXEntries('library.bib');
  });
  const loadLibrary = () => loadBibLaTeXLibrary(entries);

  test('loads', () => {
    expect(entries.length).toBe(4);
  });

  test('can support library', () => {
    const library = loadLibrary();
  });

  test('renders correctly', () => {
    const library = loadLibrary();
    const templateVariables: Record<string, string>[] = Object.keys(
      library.entries,
    ).map((citekey) => {
      return library.getTemplateVariablesForCitekey(citekey);
    });

    matchLibraryRender(templateVariables, expectedRender);
  });
});

describe('biblatex regression tests', () => {
  test('regression 7f9aefe (parser error handling)', () => {
    const load = () => {
      const library = loadBibLaTeXLibrary(
        loadBibLaTeXEntries('regression_7f9aefe.bib'),
      );
    };

    // Make sure we log warning
    const warnCallback = jest.fn();
    jest.spyOn(global.console, 'warn').mockImplementation(warnCallback);

    expect(load).not.toThrowError();
    expect(warnCallback.mock.calls.length).toBe(1);
  });
});

describe('csl library', () => {
  let entries: EntryDataCSL[];
  beforeEach(() => {
    const cslPath = path.join(__dirname, 'library.json');
    const csl = fs.readFileSync(cslPath, 'utf-8');
    entries = loadEntries(csl, 'csl-json') as EntryDataCSL[];
  });

  test('loads', () => {
    expect(entries.length).toBe(4);
  });

  function loadLibrary(): Library {
    return new Library(
      Object.fromEntries(
        entries.map((e: EntryDataCSL) => [e.id, new EntryCSLAdapter(e)]),
      ),
    );
  }

  test('can support library', () => {
    const library = loadLibrary();
  });

  test('renders correctly', () => {
    const library = loadLibrary();
    const templateVariables: Record<string, string>[] = Object.keys(
      library.entries,
    ).map((citekey) => {
      return library.getTemplateVariablesForCitekey(citekey);
    });

    matchLibraryRender(templateVariables, expectedRender);
  });
});
