
import { IsString, IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateAnswerDto {
    @IsOptional()
    @IsUUID()
    id?: string;

    @IsString()
    text: string;

    @IsBoolean()
    isCorrect: boolean;

    @IsOptional()
    @IsUUID()
    @Transform(({ value }) => value || null)
    mediaId: string | null;
}
