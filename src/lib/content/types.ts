export type Question = {
  id: string;
  slug: string;
  title: string;
  tags: string[];
  questionHtml: string;
  answerHtml: string;
  instructorNotesHtml?: string;
  sourcesHtml?: string;
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
  description?: string;
  chapters: GuideChapter[];
};

export type TagDefinition = {
  id: string;
  label: string;
  description?: string;
};

export type TagMap = Record<string, TagDefinition>;

export type QuestionSearchIndexEntry = {
  id: string;
  slug: string;
  title: string;
  tags: string[];
  questionText: string;
  answerText: string;
  instructorNotesText?: string;
  sourcesText?: string;
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
  description?: string;
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
