// Shared between the (server-rendered) guide page and the (client) GuideToc
// component so anchor links/IDs always agree.
export function chapterElementId(chapterNumber: number): string {
  return `chapter-${chapterNumber}`;
}

export function sectionElementId(
  chapterNumber: number,
  sectionNumber: number,
): string {
  return `section-${chapterNumber}-${sectionNumber}`;
}
