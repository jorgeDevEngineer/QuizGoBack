import { Inject, Injectable } from "@nestjs/common";
import { QuizRepository } from "../domain/port/QuizRepository";
import { Quiz } from "../domain/entity/Quiz";
import { Result } from "../../shared/Type Helpers/result";
import { IHandler } from "src/lib/shared/IHandler";

@Injectable()
export class GetAllKahootsUseCase implements IHandler<void, Result<Quiz[]>> {
  constructor(
    @Inject("QuizRepository")
    private readonly quizRepository: QuizRepository
  ) {}

  async execute(): Promise<Result<Quiz[]>> {
    try {
      const quizzes = await this.quizRepository.searchByAuthor();
      return Result.ok<Quiz[]>(quizzes);
    } catch (error) {
      // Si ocurre cualquier error inesperado, lo capturamos y devolvemos un fallo
      console.error("Error inesperado en GetAllKahootsUseCase:", error);
      return Result.fail<Quiz[]>(
        new Error("Ocurrió un error inesperado al obtener los quizzes.")
      );
    }
  }
}
