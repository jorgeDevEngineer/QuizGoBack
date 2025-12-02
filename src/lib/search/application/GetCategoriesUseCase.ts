import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { QuizRepository } from "../domain/port/QuizRepository";
import { QuizCategory } from "../domain/valueObject/Quiz";

export interface CategoriesDTO {
    categories: QuizCategory[];
}

@Injectable()
export class GetCategoriesUseCase {
    constructor(
        @Inject('QuizRepository')
        private readonly quizRepository: QuizRepository,
    ) {}

    async run(): Promise<CategoriesDTO> {
        const categories = await this.quizRepository.getCategories();
        if (!categories || categories.length === 0) {
            throw new InternalServerErrorException('Error al recuperar temas');
        }
        return { categories };
    }
}