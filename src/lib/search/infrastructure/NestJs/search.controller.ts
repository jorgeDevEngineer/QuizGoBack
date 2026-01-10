import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpException,
  HttpStatus,
  Inject,
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
    @Inject(GetFeaturedQuizzesUseCase)
    private readonly getFeaturedQuizzesUseCase: GetFeaturedQuizzesUseCase,
    @Inject(GetCategoriesUseCase)
    private readonly getCategoriesUseCase: GetCategoriesUseCase,
    @Inject(SearchQuizzesUseCase)
    private readonly searchQuizzesUseCase: SearchQuizzesUseCase,
  ) {}

  @Get()
  async search(
    @Query('q') q?: string,
    @Query('categories') categories?: string | string[],
    @Query('limit', new DefaultValuePipe(10)) limit?: number,
    @Query('page', new DefaultValuePipe(1)) page?: number,
    @Query('orderBy', new DefaultValuePipe('createdAt')) orderBy?: string,
    @Query('order', new DefaultValuePipe('desc')) order: 'asc' | 'desc' = 'desc'
  ) {
    // Normalizar categorías: convertir string a array si es necesario
    let normalizedCategories: string[] | undefined;
    if (categories) {
      if (Array.isArray(categories)) {
        normalizedCategories = categories.filter(c => c && typeof c === 'string' && c.trim().length > 0);
      } else if (typeof categories === 'string' && categories.trim().length > 0) {
        normalizedCategories = [categories];
      }
    }

    const result = await this.searchQuizzesUseCase.execute({ 
      q, 
      categories: normalizedCategories, 
      limit, 
      page, 
      orderBy, 
      order 
    });

    if (result.isFailure) {
      throw new HttpException(result.error?.message || 'Search failed', HttpStatus.BAD_REQUEST);
    }

    return result.getValue();
  }

  @Get('featured')
  async getFeatured(
    @Query('limit', new DefaultValuePipe(10)) limit?: number,
  ) {
    const result = await this.getFeaturedQuizzesUseCase.execute({ limit: limit ?? 10 });

    if (result.isFailure) {
      throw new HttpException(result.error?.message || 'Featured quizzes not found', HttpStatus.NOT_FOUND);
    }

    return result.getValue();
  }

  @Get('categories')
  async getCategories() {
    const result = await this.getCategoriesUseCase.execute();

    if (result.isFailure) {
      throw new HttpException(result.error?.message || 'Categories not found', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return result.getValue();
  }
}
