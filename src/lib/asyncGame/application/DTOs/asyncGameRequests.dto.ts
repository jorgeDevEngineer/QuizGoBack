export class StartGameRequestDto {
  kahootid: string; 
}

export class SubmitAnswerRequestDto {
  slideId: string;
  answerIndex?: number | number[];
  timeElapsedSeconds?: number;
}