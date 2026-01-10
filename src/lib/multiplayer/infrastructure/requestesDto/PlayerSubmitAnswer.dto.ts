import { IsArray, IsNumber, IsString, IsUUID, Min } from "class-validator";

export class PlayerSubmitAnswerDto {

    @IsUUID()
    questionId: string;


    @IsArray()
    @IsString({ each: true })
    answerId: string[];


    @IsNumber()
    @Min( 0 )
    timeElapsedMs: number;

}