import { Either } from "../../../shared/Type Helpers/Either";
import { DomainException } from "../../../shared/exceptions/DomainException";
import { QuizzesNotFoundException } from "../../../shared/exceptions/QuizzesNotFoundException";
import { DomainUnexpectedException } from "../../../shared/exceptions/DomainUnexpectedException";
import { CompletedQuizResponse, toSingleCompletedQuizResponse } from "../../application/Response Types/CompletedQuizResponse";
import { SinglePlayerGameRepository } from "../port/SinglePlayerRepository";
import { CompletedQuizQueryCriteria } from "../../application/Response Types/CompletedQuizQueryCriteria";
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";; 
import { QuizRepository } from "../../../kahoot/domain/port/QuizRepository";
import { QuizId } from "../../../kahoot/domain/valueObject/Quiz";

export class GetUserResultsDomainService {
    constructor(
        private singlePlayerGameRepository: SinglePlayerGameRepository,
        private quizRepository: QuizRepository
    ) {}

    public async execute(
        userId: UserId,
        criteria: CompletedQuizQueryCriteria
    ): Promise<Either<DomainException, CompletedQuizResponse[]>> {

        const completedQuizzes = await this.singlePlayerGameRepository.findCompletedGames(userId, criteria);

        if (completedQuizzes.length === 0) {
            return Either.makeLeft(new QuizzesNotFoundException("El usuario no ha completado nigun kahoot."));
        }

        const results: CompletedQuizResponse[] = [];

       for (const quiz of completedQuizzes) {
        const quizId = QuizId.of(quiz.getQuizId().getValue());
        const quizData = await this.quizRepository.find(quizId);

        if (!quizData) {
                return Either.makeLeft(new DomainUnexpectedException());
            }

        results.push(toSingleCompletedQuizResponse(quiz, quizData));
        }
        return Either.makeRight(results);
    }
}