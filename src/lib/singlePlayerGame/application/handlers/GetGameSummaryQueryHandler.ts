import { SinglePlayerGameRepository } from "../../domain/repositories/SinglePlayerGameRepository";
import { GetGameSummaryQuery } from "../parameterObjects/GetGameSummaryQuery";
import { GameSummaryResponseDto } from "../dtos/SinglePlayerGameResponses.dto";
import { SinglePlayerGameId } from "../../domain/valueObjects/SinglePlayerGameVOs";
import { IHandler } from "src/lib/shared/IHandler";

export class GetGameSummaryQueryHandler implements IHandler<GetGameSummaryQuery, GameSummaryResponseDto> {

    constructor(private readonly gameRepo:SinglePlayerGameRepository) {}

    async execute(command: GetGameSummaryQuery): Promise<GameSummaryResponseDto> {

        const game = await this.gameRepo.findById(SinglePlayerGameId.of(command.attemptId));
        if (!game) {
            throw new Error(`No se encontró la partida de id ${command.attemptId}`);
        }

        if (!game.isComplete()) {
            throw new Error('La partida no ha sido completada por lo que no se puede ver el resumen de partida');
        }

        const correctAnswers:number = game.getCorrectAnswersCount();
        const totalQuestions:number = game.getTotalQuestions();


        return {
            attemptId: game.getGameId().getId(),
            finalScore: game.getScore().getScore(),
            totalCorrect: correctAnswers,
            totalQuestions: totalQuestions,
            accuracyPercentage: Math.round((correctAnswers / totalQuestions) * 100)
        };

    }

}