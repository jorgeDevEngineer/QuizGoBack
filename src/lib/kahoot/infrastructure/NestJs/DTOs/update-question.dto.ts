
import { IsString, IsOptional, IsUUID, IsIn, IsInt, ValidateNested, IsArray, IsNumber } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { UpdateAnswerDto } from './update-answer.dto';

const allowedQuestionTypes = ['single', 'multiple', 'true_false', 'quiz'];
const allowedTimeLimits = [5, 10, 20, 30, 45, 60, 90, 120, 180, 240];
const allowedPoints = [0, 500, 1000, 2000];

export class UpdateQuestionDto {
    @IsUUID()
    id: string; // El ID es obligatorio para identificar la pregunta a actualizar.

    @IsString()
    text: string;

    @IsIn(allowedQuestionTypes)
    type: 'single' | 'multiple' | 'true_false' | 'quiz';

    @IsIn(allowedTimeLimits)
    timeLimit: number;

    @IsIn(allowedPoints)
    points: number;

    @IsOptional()
    @IsNumber()
    position?: number;

    @IsOptional()
    @IsUUID()
    @Transform(({ value }) => value || null)
    mediaId: string | null;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateAnswerDto)
    answers?: UpdateAnswerDto[];
}
