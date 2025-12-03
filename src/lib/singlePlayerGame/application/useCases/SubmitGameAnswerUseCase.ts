import { SinglePlayerGameRepository } from "../../domain/repositories/SinglePlayerGameRepository";
import { QuizRepository } from "src/lib/kahoot/domain/port/QuizRepository";
import { SubmitAnswerCommand } from "../helpers/SinglePlayerGameCommands";
import { AnswerEvaluationResponseDto } from "../helpers/SinglePlayerGameResponses.dto";
import { SinglePlayerEvaluationService } from "../../domain/services/SinglePlayerEvaluationService";
import { Optional, PlayerAnswer, SinglePlayerGameId } from "../../domain/valueObjects/SinglePlayerGameVOs";
import { QuestionId } from "src/lib/kahoot/domain/valueObject/Question";

export class SubmitGameAnswerUseCase {

    constructor(
        private readonly gameRepo: SinglePlayerGameRepository,
        private readonly quizRepo: QuizRepository,
        private readonly evaluationService: SinglePlayerEvaluationService
    ) {}

    async execute(command: SubmitAnswerCommand): Promise<AnswerEvaluationResponseDto> {

        const game = await this.gameRepo.findById(SinglePlayerGameId.of(command.attemptId));
        if (!game) {
            throw new Error(`No se encontró la partida de id ${command.attemptId}`);
        }

        if (game.isComplete()) {
            throw new Error('La partida ya ha sido completada');
        }

        if (game.hasAnsweredQuestion(QuestionId.of(command.slideId))) {
            throw new Error('La pregunta que se quiere responder ya ha sido respondida');
        }

        const timeUsedMs = (command.timeElapsedSeconds || 0) * 1000;
        const playerAnswer = PlayerAnswer.create(
            QuestionId.of(command.slideId),
            new Optional<number | number[]>(command.answerIndex),
            timeUsedMs
        );

        const questionResult = await this.evaluationService.evaluate(
            game.getQuizId(),
            playerAnswer,
            this.quizRepo
        );

        game.submitGameAnswer(questionResult);

        let nextSlide = undefined;
        if (!game.isComplete()) {
            const quiz = await this.quizRepo.find(game.getQuizId());
            const nextQuestionId:Optional<QuestionId> = game.findNextQuestionId(quiz.getQuestionIds());
            if (nextQuestionId.hasValue()) {
                nextSlide = quiz.getQuestionById(nextQuestionId.getValue()).toResponseDto();
            }
        } 

        await this.gameRepo.save(game);

        return {
            wasCorrect: questionResult.getEvaluatedAnswer().getWasCorrect(),
            pointsEarned: questionResult.getEvaluatedAnswer().getPointsEarned(),
            updatedScore: game.getScore().getScore(),
            attemptState: game.isComplete() ? 'COMPLETED' : 'IN_PROGRESS',
            nextSlide
        };

    }
}