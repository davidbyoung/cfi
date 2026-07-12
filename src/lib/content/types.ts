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

export type ContentLibrary = {
  questions: Question[];
  questionMap: Record<string, Question>;
  guides: Guide[];
  guideMap: Record<string, Guide>;
  tags: TagMap;
  searchIndex: QuestionSearchIndexEntry[];
};
