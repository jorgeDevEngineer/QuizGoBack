import {
    Controller,
    DefaultValuePipe,
    Get,
    InternalServerErrorException,
    Query,
  } from '@nestjs/common';
  import { GetFeaturedQuizzesUseCase } from '../../application/GetFeaturedQuizzesUseCase';
  import { IsString, Length } from 'class-validator';
import { GetCategoriesUseCase } from '../../application/GetCategoriesUseCase';


export class FindOneParams {
    @IsString()
    @Length(5, 255)
    id: string;
 }

@Controller('explore')
export class SearchController {
    constructor(
        private readonly getFeaturedQuizzesUseCase: GetFeaturedQuizzesUseCase,
        private readonly getCategoriesUseCase: GetCategoriesUseCase,
    ){}


    @Get('featured')
    async getFeatured(
        @Query('limit', new DefaultValuePipe(10)) limit?: number,
    ) {
        try {
            const quizzes = await this.getFeaturedQuizzesUseCase.run(limit);
            return quizzes;
        } catch (e) {
            throw new InternalServerErrorException(e.message);
        }
    }
    @Get('categories')
    async getCategories() {
        try {
            const categories = await this.getCategoriesUseCase.run();
            return categories;
        } catch (e) {
            throw new InternalServerErrorException(e.message);
        }
    }
}