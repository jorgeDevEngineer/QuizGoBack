import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { QuizRepository } from "../domain/port/QuizRepository";
import { Quiz } from "../domain/entity/Quiz";

export interface SearchParamsDto {
    q?: string,
    categories?: string[],
    limit: number,
    page: number,
    orderBy: string
    order: 'asc' | 'desc',
}

export interface SearchResultDto {
    data: Quiz[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
    };
  }



@Injectable()
export class SearchQuizzesUseCase {
    constructor(
        @Inject('QuizRepository')
        private readonly quizRepository: QuizRepository,
    ) {}

    async run(params: SearchParamsDto): Promise<SearchResultDto> {
        const result = await this.quizRepository.search(params);
        if (!result) {
            throw new NotFoundException('Quizzes not found');
        }
        return result;
    }
}