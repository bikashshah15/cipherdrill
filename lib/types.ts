export const QUESTION_TYPES = [
  "MECHANISM",
  "NOT_PROVIDE",
  "DIAGRAM",
  "GAME_WALK",
  "DISTRACTOR_TRAP",
  "APPLICATION",
  "SYNTHESIS"
] as const;

export const DIFFICULTIES = [
  "Foundational",
  "Core",
  "Advanced",
  "Trap"
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];
export type Difficulty = (typeof DIFFICULTIES)[number];

export type Choice = {
  id: string;
  text: string;
};

export type QuestionBankQuestion = {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  topic: string;
  stem: string;
  choices: Choice[];
  correctAnswer: string;
  mechanisticExplanation: string;
  distractorAnalysis: Record<string, string>;
  trapCategories: string[];
  diagramRef: string | null;
  gameRef: string | null;
};

export type QuestionBank = {
  lectureId: string;
  lectureTitle: string;
  lectureNumber: number;
  topics: string[];
  questions: QuestionBankQuestion[];
};

export type SerializableQuestion = QuestionBankQuestion & {
  dbId: number;
  lectureId: string;
  lectureTitle: string;
  lectureNumber: number;
  attempts: number;
  correctAttempts: number;
  dueForReview: boolean;
  lastAttemptCorrect: boolean | null;
};

export type LectureCardData = {
  id: number;
  lectureId: string;
  title: string;
  lectureNumber: number;
  topics: string[];
  questionCount: number;
  importedAt: string;
  lastAttemptedAt: string | null;
  attempts: number;
  correctAttempts: number;
  accuracy: number | null;
  weakestTrapCategory: string | null;
};

export type DashboardStats = {
  totalQuestions: number;
  totalAttempts: number;
  overallAccuracy: number | null;
  currentStreak: number;
  lectures: LectureCardData[];
};

export type IngestValidationError = {
  filePath: string;
  fieldPath: string;
  message: string;
};

export type IngestSummary = {
  ingested: number;
  updated: number;
  primersLinked: number;
  errors: IngestValidationError[];
};

export type ConceptHeading = {
  id: string;
  text: string;
  level: number;
};

export type ConceptPrimer = {
  lectureId: string;
  content: string | null;
  headings: ConceptHeading[];
};

export type AnalyticsDatum = {
  name: string;
  attempts: number;
  correct: number;
  accuracy: number;
};

export type HeatmapCell = {
  topic: string;
  difficulty: Difficulty;
  attempts: number;
  correct: number;
  accuracy: number | null;
};

export type ReadinessScore = {
  score: number;
  coverage: number;
  accuracy: number;
  recency: number;
  explanation: string;
};

export type AnalyticsData = {
  accuracyOverTime: Array<{
    date: string;
    accuracy: number;
    attempts: number;
  }>;
  accuracyByLecture: AnalyticsDatum[];
  accuracyByType: AnalyticsDatum[];
  accuracyByTrapCategory: AnalyticsDatum[];
  heatmap: HeatmapCell[];
  readiness: ReadinessScore;
};
