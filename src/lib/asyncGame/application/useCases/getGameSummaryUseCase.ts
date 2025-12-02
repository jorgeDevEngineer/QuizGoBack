import { Injectable } from "@nestjs/common";
import { SinglePlayerGameRepository } from "../../domain/repositories/SinglePlayerGameRepository";
import { GetGameSummaryCommand } from "../helpers/asyncGameCommands";
import { GameSummaryResponseDto } from "../helpers/asyncGameResponses.dto";
import { SinglePlayerGameId } from "../../domain/valueObjects/asyncGamesVO";

@Injectable()
export class getGameSummaryUseCase {

    constructor(private readonly gameRepo:SinglePlayerGameRepository) {}

    async execute(command: GetGameSummaryCommand): Promise<GameSummaryResponseDto> {

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
            accuracyPercentage: (correctAnswers / totalQuestions) * 100
        };

    }

}