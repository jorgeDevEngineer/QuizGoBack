import {
    Controller,
    DefaultValuePipe,
    Get,
    NotFoundException,
    Param,
    Query,
  } from '@nestjs/common';
  import { GetFeaturedQuizzesUseCase } from '../../application/GetFeaturedQuizzesUseCase';
  import { IsString, Length } from 'class-validator';


export class FindOneParams {
    @IsString()
    @Length(5, 255)
    id: string;
 }

@Controller('explore')
export class SearchController {
    constructor(
        private readonly getFeaturedQuizzesUseCase: GetFeaturedQuizzesUseCase,
    ){}


    @Get('featured')
    async getFeatured(
        @Query('limit', new DefaultValuePipe(10)) limit?: number,
    ) {
        try {
            const quizzes = await this.getFeaturedQuizzesUseCase.run(limit);
            return quizzes;
        } catch (e) {
            throw new NotFoundException(e.message);
        }
    }
}