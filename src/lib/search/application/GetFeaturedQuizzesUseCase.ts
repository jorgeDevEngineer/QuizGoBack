import { Inject, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { QuizRepository } from "../domain/port/QuizRepository";
import { SearchResultDto} from "./SearchQuizzesUseCase";

@Injectable()
export class GetFeaturedQuizzesUseCase {
    constructor(
        @Inject('QuizRepository')
        private readonly quizRepository: QuizRepository,
    ) {}

    async run(limit: number): Promise<SearchResultDto> {
        // Limitar el limite maximo de quizzes a 10
        const safeLimit = Math.min(limit, 10);
        const result = await this.quizRepository.findFeatured(safeLimit);
        if (!result) {
            throw new InternalServerErrorException('Featured quizzes not found');
        }
        return result;
    }
}