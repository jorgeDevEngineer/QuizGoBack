import { Inject, Injectable } from "@nestjs/common";
import { QuizRepository } from "../domain/port/QuizRepository";
import { QuizCategory } from "../domain/valueObject/Quiz";
import { IHandler } from "src/lib/shared/IHandler";
import { Result } from "src/lib/shared/Type Helpers/result";

export interface CategoriesDTO {
    categories: {
        name: string;
    }[];
}

@Injectable()
export class GetCategoriesUseCase implements IHandler<void, Result<CategoriesDTO>> {
    constructor(
        @Inject('QuizRepository')
        private readonly quizRepository: QuizRepository,
    ) {}

    async execute(): Promise<Result<CategoriesDTO>> {
        const categories = await this.quizRepository.getCategories();
        return Result.ok<CategoriesDTO>({ categories });
    }
}
