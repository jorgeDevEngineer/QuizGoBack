import { IsString, IsNumber } from "class-validator";

export class StartGameRequestDto {
  @IsString()
  kahootId: string; 
}

export class SubmitGameAnswerRequestDto {
  @IsString()
  slideId: string;

  answerIndex: number[];
  
  @IsNumber()
  timeElapsedSeconds: number;
}