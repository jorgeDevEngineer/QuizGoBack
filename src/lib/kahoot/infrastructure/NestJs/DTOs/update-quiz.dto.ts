
import { IsString, IsOptional, IsUUID, IsIn, ValidateNested, IsArray, IsNotEmpty } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { UpdateQuestionDto } from './update-question.dto';

const allowedVisibilities = ['public', 'private'];
const allowedStatuses = ['draft', 'publish'];

export class UpdateQuizDto {

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    title?: string;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => value || null)
    description?: string | null;

    @IsOptional()
    @IsIn(allowedVisibilities, { message: 'Visibility must be either public or private' })
    @Transform(({ value }) => value.toLowerCase())
    visibility?: 'public' | 'private';

    @IsOptional()
    @IsIn(allowedStatuses, { message: 'Status must be either draft or publish' })
    @Transform(({ value }) => value.toLowerCase())
    status?: 'draft' | 'publish';

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsUUID()
    themeId?: string;

    @IsOptional()
    @IsUUID()
    @Transform(({ value }) => value || null)
    coverImageId?: string | null;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateQuestionDto)
    questions: UpdateQuestionDto[];
}
