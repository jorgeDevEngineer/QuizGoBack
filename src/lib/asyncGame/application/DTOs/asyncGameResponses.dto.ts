export class SlideResponseDto {
  slideId: string;
  mediaID?: string | null;
  questionType: string;
  questionText: string;
  timeLimitSeconds: number;
  options: Array<{
    index: string;
    text?: string | null;
    mediaID?: string | null;
  }>;
}

export class StartGameResponseDto {
  attemptId: string;
  firstSlide: SlideResponseDto;
}

export class GameProgressResponseDto {
  attemptId: string;
  state: 'IN_PROGRESS' | 'COMPLETED';
  currentScore: number;
  nextSlide?: SlideResponseDto;
}

export class AnswerEvaluationResponseDto {
  wasCorrect: boolean;
  pointsEarned: number;
  updatedScore: number;
  attemptState: 'IN_PROGRESS' | 'COMPLETED';
  nextSlide?: SlideResponseDto;
}

export class GameSummaryResponseDto {
  attemptId: string;
  finalScore: number;
  totalCorrect: number;
  totalQuestions: number;
  accuracyPercentage: number;
}