import i18n from './i18n';

/**
 * FM - Format Message
 *
 * Helper function to format localized messages with parameters.
 * Uses {{p1}}, {{p2}}, {{p3}} convention for parameter placeholders.
 */
export function FM(id: string, p1?: string, p2?: string, p3?: string): string {
  const options: Record<string, string | undefined> = {};
  if (p1 !== undefined) options['p1'] = p1;
  if (p2 !== undefined) options['p2'] = p2;
  if (p3 !== undefined) options['p3'] = p3;
  return i18n.t(id, options);
}
