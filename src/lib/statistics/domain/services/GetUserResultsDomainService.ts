import { Either } from "../../../shared/Type Helpers/Either";
import { DomainException } from "../../../shared/exceptions/DomainException";
import { QuizzesNotFoundException } from "../../../shared/exceptions/QuizzesNotFoundException";
import { CompletedQuizResponse, toSingleCompletedQuizResponse } from "../../application/Response Types/CompletedQuizResponse";
import { SinglePlayerGameRepository } from "../port/SinglePlayerRepository";
import { CompletedQuizQueryCriteria } from "../../application/Response Types/CompletedQuizQueryCriteria";
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";; 
import { QuizRepository } from "../../../kahoot/domain/port/QuizRepository";
import { QuizId } from "../../../kahoot/domain/valueObject/Quiz";
import { QuizNotFoundException } from "src/lib/shared/exceptions/QuizNotFoundException";
import { SinglePlayerGame } from "src/lib/singlePlayerGame/domain/aggregates/SinglePlayerGame";
import { Quiz } from "src/lib/kahoot/domain/entity/Quiz";

export class GetUserResultsDomainService {
    constructor(
        private readonly singlePlayerGameRepository: SinglePlayerGameRepository,
        private readonly quizRepository: QuizRepository
    ) {}

    public async execute(
        userId: UserId,
        criteria: CompletedQuizQueryCriteria
    ): Promise<Either<DomainException, {games: SinglePlayerGame[], quizzes: Quiz[], totalGames: number}>> {

        const { games: completedQuizzes, totalGames } = await this.singlePlayerGameRepository.findCompletedGames(userId, criteria);

        if (completedQuizzes.length === 0) {
            return Either.makeLeft(new QuizzesNotFoundException("El usuario no ha completado nigun kahoot."));
        }

        const quizzes: Quiz[] = [];

       for (const quiz of completedQuizzes) {
        const quizId = QuizId.of(quiz.getQuizId().getValue());
        const quizData = await this.quizRepository.find(quizId);

        if (!quizData) {
                return Either.makeLeft(new QuizNotFoundException());
            }

        quizzes.push(quizData);
        }

        return Either.makeRight({games: completedQuizzes, quizzes, totalGames});
    }
}