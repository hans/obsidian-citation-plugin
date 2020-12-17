declare module 'citation-js' {
  export = Cite;
  function Cite(data: any, opts: any): Cite;
  class Cite {
      constructor(data: any, opts: Record<string, any>);
      _options: Record<string, any>;
      log: any;
      data: object[];
  }
  namespace Cite {
      const async: any;
      const validateOptions: any;
      const validateOutputOptions: any;
      const input: any;
      const inputAsync: any;
      const util: any;
      namespace version {
          const cite: any;
          const citeproc: any;
      }
      namespace CSL {
          const engine: any;
          function item(data: any): (id: any) => any;
          function item(data: any): (id: any) => any;
          function locale(lang: any): any;
          function locale(lang: any): any;
          function style(style: any): any;
          function style(style: any): any;
          namespace register {
              const addTemplate: any;
              const getTemplate: any;
              const hasTemplate: any;
              const addLocale: any;
              const getLocale: any;
              const hasLocale: any;
          }
      }
      const plugins: {};
      const parse: any;
      const get: any;
  }
}
