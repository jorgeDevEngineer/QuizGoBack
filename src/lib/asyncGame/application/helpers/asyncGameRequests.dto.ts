import { IsString, IsNumber, IsOptional } from "class-validator";

export class StartGameRequestDto {
  @IsString()
  kahootid: string; 
}

export class SubmitAnswerRequestDto {
  @IsString()
  slideId: string;

  @IsOptional()
  answerIndex?: number | number[];
  
  @IsNumber()
  @IsOptional()
  timeElapsedSeconds?: number;
}