
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { CreateQuestionDto } from './create-question.dto';

enum Visibility {
    PUBLIC = 'public',
    PRIVATE = 'private',
}

enum Status {
    DRAFT = 'draft',
    PUBLISHED = 'publish',
}

export class CreateQuizDto {

    @IsString()
    @IsNotEmpty()
    public readonly title: string;

    @IsString()
    @IsNotEmpty()
    public readonly description: string;

    @IsString()
    @IsOptional()
    public readonly coverImageId: string | null;

    @IsEnum(Visibility)
    @Transform(({ value }) => value.toLowerCase())
    public readonly visibility: Visibility;

    @IsEnum(Status)
    @Transform(({ value }) => value.toLowerCase())
    public readonly status: Status;

    @IsString()
    @IsNotEmpty()
    public readonly category: string;

    @IsString()
    @IsNotEmpty()
    public readonly themeId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateQuestionDto)
    public readonly questions: CreateQuestionDto[];
}
