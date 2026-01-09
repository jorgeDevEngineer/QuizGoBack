
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAnswerDto {
    @IsString()
    @IsNotEmpty()
    public readonly text: string;

    @IsBoolean()
    public readonly isCorrect: boolean;

    @IsString()
    @IsOptional()
    public readonly mediaId: string | null;
}
