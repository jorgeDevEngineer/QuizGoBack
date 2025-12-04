import { QuizRepository } from '../../domain/port/QuizRepository';
import { Quiz } from 'src/lib/kahoot/domain/entity/Quiz';
import {QuizId, UserId as UserIdQuizVo} from "src/lib/kahoot/domain/valueObject/Quiz";
import { UserId } from 'src/lib/user/domain/valueObject/UserId';
import { SinglePlayerGameRepository} from 'src/lib/singlePlayerGame/domain/repositories/SinglePlayerGameRepository';
import { UserRepository } from 'src/lib/user/domain/port/UserRepository';

export class GetInProgressQuizzesUseCase {
  constructor(private readonly quizRepository: QuizRepository,
  private readonly userRepo: UserRepository,
  private readonly singlePlayerRepo: SinglePlayerGameRepository) {}

  async run(id: string): Promise<Quiz> {
    // 1. Convertir string a Value Object
    const quizId = QuizId.of(id);

    // 2. Buscar en el repositorio
    const quiz = await this.quizRepository.find(quizId);

    // 3. Validar existencia
    if (!quiz) {
      throw new Error(`Quiz with id <${id}> not found`); 
      // Esto el Controller lo debe capturar y devolver un 404
    }

    return quiz;
  }
}