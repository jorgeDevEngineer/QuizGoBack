import { IsString, IsNumber } from "class-validator";

export class StartGameRequestDto {
  @IsString()
  kahootId: string; 
}

export class SubmitAnswerRequestDto {
  @IsString()
  slideId: string;

  answerIndex: number[];
  
  @IsNumber()
  timeElapsedSeconds: number;
}