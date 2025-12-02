import { Injectable } from "@nestjs/common";
import { GetGameProgressCommand } from "../helpers/asyncGameCommands";
import { GameProgressResponseDto } from "../helpers/asyncGameResponses.dto";
import { Optional, SinglePlayerGameId } from "../../domain/valueObjects/asyncGamesVO";
import { SinglePlayerGameRepository } from "../../domain/repositories/SinglePlayerGameRepository";
import { QuizRepository } from "src/lib/kahoot/domain/port/QuizRepository";
import { QuestionId } from "src/lib/kahoot/domain/valueObject/Question";

@Injectable()
export class getGameProgressUseCase {

    constructor(
        private readonly gameRepo: SinglePlayerGameRepository,
        private readonly quizRepo: QuizRepository
    ) {}

    async execute(command: GetGameProgressCommand): Promise<GameProgressResponseDto> {

        const game = await this.gameRepo.findById(SinglePlayerGameId.of(command.attemptId));
        if (!game) {
            throw new Error(`No se encontró la partida de id ${command.attemptId}`);
        }

        const quiz = await this.quizRepo.find(game.getQuizId());
        const nextQuestionId:Optional<QuestionId> = game.findNextQuestionId(quiz.getQuestionIds());

        if (nextQuestionId.hasValue()){
            const nextQuestion = quiz.getQuestionById(nextQuestionId.getValue());
            return {
                attemptId: game.getGameId().getId(),
                state: game.isComplete() ? 'COMPLETED' : 'IN_PROGRESS',
                currentScore: game.getScore().getScore(),
                nextSlide: nextQuestion.toResponseDto()
            };
        } else {
            return {
                attemptId: game.getGameId().getId(),
                state: game.isComplete() ? 'COMPLETED' : 'IN_PROGRESS',
                currentScore: game.getScore().getScore(),
                nextSlide: null
            };
        }

    }
}