import {
    Controller,
    DefaultValuePipe,
    Get,
    InternalServerErrorException,
    NotFoundException,
    Query,
  } from '@nestjs/common';
  import { GetFeaturedQuizzesUseCase } from '../../application/GetFeaturedQuizzesUseCase';
  import { IsString, Length } from 'class-validator';
import { GetCategoriesUseCase } from '../../application/GetCategoriesUseCase';
import { SearchQuizzesUseCase } from '../../application/SearchQuizzesUseCase';


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
        private readonly searchQuizzesUseCase: SearchQuizzesUseCase,
    ){}

    @Get()
    async search(
        @Query('q') q?: string,
        @Query('categories') categories?: string | string[],
        @Query('limit', new DefaultValuePipe(10)) limit?: number,
        @Query('page', new DefaultValuePipe(1)) page?: number,
        @Query('orderBy', new DefaultValuePipe('createdAt')) orderBy?: string,
        @Query('order', new DefaultValuePipe('desc')) order: 'asc' | 'desc' = 'desc'
    ) {
        try {
            // Normalizar categorías: convertir string a array si es necesario
            let normalizedCategories: string[] | undefined;
            if (categories) {
                if (Array.isArray(categories)) {
                    normalizedCategories = categories.filter(c => c && typeof c === 'string' && c.trim().length > 0);
                } else if (typeof categories === 'string' && categories.trim().length > 0) {
                    normalizedCategories = [categories];
                }
            }

            const result = await this.searchQuizzesUseCase.run({ 
                q, 
                categories: normalizedCategories, 
                limit, 
                page, 
                orderBy, 
                order 
            });
            
            return result;
        } catch (e) {
            throw new NotFoundException(e.message);
        }
    }

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