import { Inject, Injectable } from "@nestjs/common";
import { QuizRepository } from "../domain/port/QuizRepository";
import { QuizCategory } from "../domain/valueObject/Quiz";

export interface CategoriesDTO {
    categories: {
        name: string;
    }[];
}

@Injectable()
export class GetCategoriesUseCase {
    constructor(
        @Inject('QuizRepository')
        private readonly quizRepository: QuizRepository,
    ) {}

    async run(): Promise<CategoriesDTO> {
        const categories = await this.quizRepository.getCategories();
        return { categories };
    }
}