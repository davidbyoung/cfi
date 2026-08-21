export type Question = {
  id: string;
  tags: string[];
  questionHtml: string;
  answerHtml: string;
  instructorNotesHtml?: string;
  sourcesHtml?: string;
  supplementsHtml?: string;
};

export type GuideSection = {
  title: string;
  questions: Question[];
};

export type GuideChapter = {
  title: string;
  sections: GuideSection[];
};

export type Guide = {
  title: string;
  slug: string;
  chapters: GuideChapter[];
};

export type TagDefinition = {
  id: string;
  label: string;
  description?: string;
};

export type TagMap = Record<string, TagDefinition>;

// Derived from Question (not redeclared) so a new field on Question can't be
// silently missing here.
export type QuestionSearchIndexEntry = Question & {
  questionText: string;
  answerText: string;
  instructorNotesText?: string;
  sourcesText?: string;
  supplementsText?: string;
  // Human-readable tag labels (e.g. "Surface Analysis"), not the raw
  // hyphenated ids in `tags` (e.g. "surface-analysis") — free-text search
  // matches against these so a multi-word query can match a tag by name.
  tagLabels: string[];
};

export type RawGuideSection = {
  title: string;
  questionIds: string[];
};

export type RawGuideChapter = {
  title: string;
  sections: RawGuideSection[];
};

export type RawGuide = {
  title: string;
  slug: string;
  chapters: RawGuideChapter[];
};

export type RawGuideCategory = {
  title: string;
  guideSlugs: string[];
};

export type GuideCategory = {
  title: string;
  guides: Guide[];
};

export type ContentLibrary = {
  questions: Question[];
  questionMap: Record<string, Question>;
  guides: Guide[];
  guideMap: Record<string, Guide>;
  guideCategories: GuideCategory[];
  tags: TagMap;
  searchIndex: QuestionSearchIndexEntry[];
};
