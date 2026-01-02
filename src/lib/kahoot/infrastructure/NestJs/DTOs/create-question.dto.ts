
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAnswerDto } from './create-answer.dto';
import { QuestionType } from '../../../domain/valueObject/Question';


export class CreateQuestionDto {
    @IsString()
    @IsNotEmpty()
    public readonly text: string;

    @IsEnum(QuestionType)
    public readonly type: QuestionType;

    @IsInt()
    public readonly timeLimit: number;

    @IsInt()
    public readonly points: number;

    @IsString()
    @IsOptional()
    public readonly mediaId: string | null;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateAnswerDto)
    public readonly answers: CreateAnswerDto[];
}
