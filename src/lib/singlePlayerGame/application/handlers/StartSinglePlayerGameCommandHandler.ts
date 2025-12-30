import { StartSinglePlayerGameCommand } from "../parameterObjects/StartSinglePlayerGameCommand";
import { StartGameResponseDto } from "../dtos/SinglePlayerGameResponses.dto";
import { QuizId, UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { SinglePlayerGame } from "../../domain/aggregates/SinglePlayerGame";
import { SinglePlayerGameId } from "../../domain/valueObjects/SinglePlayerGameVOs";
import { SinglePlayerGameRepository } from "../../domain/repositories/SinglePlayerGameRepository";
import { QuizRepository } from "src/lib/kahoot/domain/port/QuizRepository";
import { IHandler } from "src/lib/shared/IHandler";

export class StartSinglePlayerGameCommandHandler implements IHandler<StartSinglePlayerGameCommand, StartGameResponseDto>{

    constructor(
        private readonly gameRepo: SinglePlayerGameRepository,
        private readonly quizRepo: QuizRepository
    ) {}

    async execute(command: StartSinglePlayerGameCommand): Promise<StartGameResponseDto> { 

        const activeGame = await this.gameRepo.findInProgressGameByPlayerAndQuiz(
            UserId.of(command.playerId),
            QuizId.of(command.kahootId)
        );

        //Esto no debería pasar porque el front siempre debería llamar a la ruta de este caso para iniciarlo no para retomarlo 
        // pero por si acaso
        if (activeGame) {
            throw new Error('El quiz que quieres empezar ya está activo');
        }

        const quiz = await this.quizRepo.find(QuizId.of(command.kahootId));
        if (!quiz) {
            throw new Error(`No se encontró el quiz de id ${command.kahootId}`);
        }

        const game = SinglePlayerGame.create(
            SinglePlayerGameId.generate(),
            QuizId.of(command.kahootId),
            quiz.getTotalQuestions(),
            UserId.of(command.playerId)
        );

        await this.gameRepo.save(game);

        return {
            attemptId: game.getGameId().getId(),
            firstSlide: quiz.getFirstQuestion().toResponseDto()
        };
    }

}