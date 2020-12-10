export function formatTemplate(template: string, environment: {[key: string]: string}): string {
  return template.replace(/{{([\w_]+)}}/g, function(match, key) {
    if (key in environment) {
      return environment[key];
    }

    return `(Unknown template variable ${key})`;
  })
}
