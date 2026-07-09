// Shared across question, guide, and tag parsing so the kebab-case rule for
// filenames, ids, and slugs can't drift out of sync between them.
export const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function isKebabCase(value: string): boolean {
  return KEBAB.test(value);
}
