/**
 * Gives a value of a property by a path in an object
 * @param obj - Object to get a value
 * @param path - Path to a property
 * @returns Value of a property
 */
function getValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

/**
 * Render a template string with data
 * @param template - Template string
 * @param data - Data object
 * @returns Rendered template
 */
export function renderTemplate(
  template: string,
  data: Record<string, any>,
): string {
  // Process conditional blocks {{?var}}...{{/?}}
  const conditionalRegex = /{{\?\s*([\w\.]+)\s*}}([\s\S]*?){{\/\?}}/g;
  template = template.replace(
    conditionalRegex,
    (match: string, p1: string, p2: string) => {
      const value = getValue(data, p1);
      return value ? p2 : '';
    },
  );

  // Replace variables {{var}} or {{object.property}}
  const variableRegex = /{{\s*([\w\.]+)\s*}}/g;
  template = template.replace(variableRegex, (match: string, p1: string) => {
    const value = getValue(data, p1);
    return value !== undefined && value !== null ? value : '';
  });

  return template;
}
