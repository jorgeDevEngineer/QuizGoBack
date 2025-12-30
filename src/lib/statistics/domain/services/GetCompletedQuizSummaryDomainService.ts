import { Either } from "../../../shared/Type Helpers/Either";
import { DomainException } from "../../../shared/exceptions/DomainException";
import { QuizPersonalResult, toQuizPersonalResult } from "../../application/Response Types/QuizPersonalResult";
import { SinglePlayerGameRepository } from "../port/SinglePlayerRepository";
import { QuizRepository } from "../../../kahoot/domain/port/QuizRepository";
import { QuizNotFoundException } from "src/lib/shared/exceptions/QuizNotFoundException";
import { GameNotFoundException } from "src/lib/shared/exceptions/GameNotFoundException";
import { SinglePlayerGameId } from "src/lib/singlePlayerGame/domain/valueObjects/SinglePlayerGameVOs";
import { Quiz } from "src/lib/kahoot/domain/entity/Quiz";
import { SinglePlayerGame } from "src/lib/singlePlayerGame/domain/aggregates/SinglePlayerGame";

export class GetCompletedQuizSummaryDomainService {
    constructor(
        private readonly singlePlayerGameRepository: SinglePlayerGameRepository,
        private readonly quizRepository: QuizRepository
    ) {}

    public async execute(
        gameId: SinglePlayerGameId
    ): Promise<Either<DomainException, {game: SinglePlayerGame, quiz: Quiz}>>{

    const completedGame = await this.singlePlayerGameRepository.findById(gameId);

     if (!completedGame) {
        return Either.makeLeft(new GameNotFoundException("No se ha encontrado al partida solicitada."));
       }
        
     const quizId = completedGame.getQuizId();
     const quizData =  await this.quizRepository.find(quizId);

     if (!quizData) {
            return Either.makeLeft(new QuizNotFoundException());
         }
     return Either.makeRight({game: completedGame, quiz: quizData});
   } 
}