import { Inject, Injectable } from "@nestjs/common";
import { QuizRepository } from "../domain/port/QuizRepository";
import { SearchResultDto } from "./SearchQuizzesUseCase";
import { IHandler } from "src/lib/shared/IHandler";
import { Result } from "src/lib/shared/Type Helpers/result";

export interface GetFeaturedQuizzesParams {
    limit: number;
}

@Injectable()
export class GetFeaturedQuizzesUseCase implements IHandler<GetFeaturedQuizzesParams, Result<SearchResultDto>> {
    constructor(
        @Inject('QuizRepository')
        private readonly quizRepository: QuizRepository,
    ) {}

    async execute(params: GetFeaturedQuizzesParams): Promise<Result<SearchResultDto>> {
        // Limitar el limite maximo de quizzes a 10
        const safeLimit = Math.min(params.limit, 10);
        const result = await this.quizRepository.findFeatured(safeLimit);
        
        if (!result) {
            return Result.fail<SearchResultDto>(new Error('Featured quizzes not found'));
        }
        
        return Result.ok<SearchResultDto>(result);
    }
}
