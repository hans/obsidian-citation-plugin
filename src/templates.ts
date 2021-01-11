import { TemplateDelegate } from 'handlebars';

import { Entry, Library } from './types';

export class Templater {
  templates: Record<string, TemplateDelegate> = {};

  constructor(public library: Library) {}

  format(citekey: string, templateKey: string) {
    const context = this.library.getTemplateVariablesForCitekey(citekey);
    const template = this.templates[templateKey];

    return template(context);
  }
}
