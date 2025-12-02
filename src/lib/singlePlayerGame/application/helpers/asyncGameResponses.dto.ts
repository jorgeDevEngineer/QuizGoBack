import { IsString, IsOptional, IsNumber, IsIn, IsBoolean  } from "class-validator";

export class SlideResponseDto {
  @IsString()
  slideId: string;

  @IsString()
  questionType: string;

  @IsString()
  questionText: string;

  @IsNumber()
  timeLimitSeconds: number;

  @IsOptional()
  mediaID?: string | null;

  options: Array<{
    index: string;
    text?: string | null;
    mediaID?: string | null;
  }>;
}

export class StartGameResponseDto {
  @IsString()
  attemptId: string;

  firstSlide: SlideResponseDto;
}

export class GameProgressResponseDto {
  @IsString()
  attemptId: string;

  @IsString()
  @IsIn(['IN_PROGRESS', 'COMPLETED']) 
  state: 'IN_PROGRESS' | 'COMPLETED';

  @IsNumber()
  currentScore: number;

  @IsOptional()
  nextSlide?: SlideResponseDto;
}

export class AnswerEvaluationResponseDto {
  @IsBoolean()
  wasCorrect: boolean;

  @IsNumber()
  pointsEarned: number;

  @IsNumber()
  updatedScore: number;

  @IsString()
  @IsIn(['IN_PROGRESS', 'COMPLETED']) 
  attemptState: 'IN_PROGRESS' | 'COMPLETED';

  nextSlide?: SlideResponseDto;
}

export class GameSummaryResponseDto {
  @IsString()
  attemptId: string;

  @IsNumber()
  finalScore: number;

  @IsNumber()
  totalCorrect: number;

  @IsNumber()
  totalQuestions: number;

  @IsNumber()
  accuracyPercentage: number;
}