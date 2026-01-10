import { Inject } from "@nestjs/common";
import { IHandler } from "src/lib/shared/IHandler";
import { IActiveMultiplayerSessionRepository } from "../../domain/repositories/IActiveMultiplayerSessionRepository";
import { PlayerSubmitAnswerCommand } from "../parameterObjects/PlayerSubmitAnswerCommand";
import { PlayerSubmitAnswerResponseDto } from "../responseDtos/PlayerSubmitAnswerResponse.dto";
import { PlayerId } from "../../domain/valueObjects/playerVOs";
import { PLAYER_SUBMIT_ERRORS } from "./Errors/PlayerSubmitAnswerErrors";
import { QuestionId } from "src/lib/kahoot/domain/valueObject/Question";
import { MultiplayerEvaluationService } from "../../domain/services/MultiplayerEvaluationService";
import { COMMON_ERRORS } from "./Errors/CommonErrors";


export class PlayerSubmitAnswerCommandHandler implements IHandler<PlayerSubmitAnswerCommand, PlayerSubmitAnswerResponseDto> {

    private readonly playerSubmissionEvaluationService: MultiplayerEvaluationService

    constructor(
        @Inject( 'IActiveMultiplayerSessionRepository' )
        private readonly sessionRepository: IActiveMultiplayerSessionRepository,
    ){
        this.playerSubmissionEvaluationService = new MultiplayerEvaluationService()
    }

    async execute(command: PlayerSubmitAnswerCommand): Promise<PlayerSubmitAnswerResponseDto> {

   
        // Cargamos el agregado session desde el repositorio en memoria
        const sessionWrapper = await this.sessionRepository.findByPin( command.sessionPin );

        if( !sessionWrapper ){
            throw new Error(COMMON_ERRORS.SESSION_NOT_FOUND)
        }

        const { session, quiz } = sessionWrapper
            
        const questionId = QuestionId.of( command.questionId );

        const question = quiz.getQuestionById( questionId );

        if( !question ){
            throw new Error(PLAYER_SUBMIT_ERRORS.SLIDE_NOT_FOUND);
        }

        this.playerSubmissionEvaluationService.evaluatePlayerSubmission(
            quiz,
            session,
            questionId,
            PlayerId.of(command.userId),
            command.timeElapsedMs,
            command.answerId,
        );

        return { 
            numberOfSubmissions: session.getNumberOfAnswersForAQuestion( questionId ),
        };
   
    }

}