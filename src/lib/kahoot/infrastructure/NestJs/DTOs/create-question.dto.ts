
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAnswerDto } from './create-answer.dto';

export class CreateQuestionDto {
    @IsString()
    @IsNotEmpty()
    public readonly text: string;

    @IsString()
    @IsEnum(['single', 'multiple', 'true_false'])
    public readonly type: 'single' | 'multiple' | 'true_false';

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
