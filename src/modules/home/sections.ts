// The home page's numbered rooms, in order. The eyebrow's `[N.01/07]` is read
// off this list, so the count can never disagree with the page.
export const sections = ['what-i-do'] as const;
export type SectionId = (typeof sections)[number];

export function sectionNumber(id: SectionId): number {
  return sections.indexOf(id) + 1;
}
