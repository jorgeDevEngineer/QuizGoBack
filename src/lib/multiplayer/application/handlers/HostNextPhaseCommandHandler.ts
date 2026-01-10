import { Inject } from "@nestjs/common";
import { IHandler } from "src/lib/shared/IHandler";
import { HostNextPhaseCommand } from "../parameterObjects/HostNextPhaseCommand";
import { HostNextPhaseResponseDto } from "../responseDtos/types/HostNextPhaseResponse.type";
import { StateTransition, StateTransitionsTypes } from "../../domain/valueObjects/multiplayerVOs";
import { MultiplayerSession } from "../../domain/aggregates/MultiplayerSession";
import { SessionArchiverService } from "../../domain/services/SessionArchiverService";
import { UpdateSessionProgressAndLeaderboardService } from "../../domain/services/UpdateSessionProgressAndLeaderboardService";
import { IActiveMultiplayerSessionRepository } from "../../domain/repositories/IActiveMultiplayerSessionRepository";
import { IMultiplayerSessionHistoryRepository } from "../../domain/repositories/IMultiplayerSessionHistoryRepository";
import { MapEntriesToResultsResponse } from "../mappers/MapEntriesToResultsResponse";
import { MapFinalScoreboard } from "../mappers/MapFinalScoreboard";
import { MapToQuestionResponse } from "../mappers/MapToQuestionResponse";
import { COMMON_ERRORS } from "./Errors/CommonErrors";
import { Quiz } from "src/lib/kahoot/domain/entity/Quiz";
import { SessionStateType } from "../../domain/valueObjects/multiplayerVOs";
import { QuestionStartedResponseDto } from "../responseDtos/QuestionStartedResponse.dto";
import { HostNextPhaseType } from "../responseDtos/enums/HostNextPhaseType.enum";
import { QuestionResultsResponseDto } from "../responseDtos/QuestionResultResponses.dto";
import { GameEndedResponseDto } from "../responseDtos/GameEndedResponses.dto";

export class HostNextPhaseCommandHandler implements IHandler<HostNextPhaseCommand, HostNextPhaseResponseDto> {

    private readonly updateProgressAndRankingService: UpdateSessionProgressAndLeaderboardService;
    private readonly sessionArchiverService: SessionArchiverService;

    constructor(
        @Inject('IActiveMultiplayerSessionRepository')
        private readonly sessionRepository: IActiveMultiplayerSessionRepository,

        @Inject('IMultiplayerSessionHistoryRepository')
        private readonly sessionHistoryRepository: IMultiplayerSessionHistoryRepository,
    ) {
        this.updateProgressAndRankingService = new UpdateSessionProgressAndLeaderboardService();
        this.sessionArchiverService = new SessionArchiverService(
            this.sessionHistoryRepository,
            this.sessionRepository
        );
    }

    async execute(command: HostNextPhaseCommand): Promise<HostNextPhaseResponseDto> {
        // 1. CARGAR SESIÓN
        const sessionWrapper = await this.sessionRepository.findByPin(command.sessionPin);

        if (!sessionWrapper) {
            throw new Error(COMMON_ERRORS.SESSION_NOT_FOUND);
        }

        const { session, quiz } = sessionWrapper;

        // Verificar que el quiz no sea draft
        if (quiz.isDraft()) {
            throw new Error("No se puede usar un quiz en estado draft");
        }

        // 2. ACTUALIZAR RANKING SI ESTAMOS EN QUESTION
        if (session.getSessionState().isQuestion()) {
            this.updateProgressAndRankingService.execute(quiz, session);
        }

        // 3. TRANSICIONAR ESTADO
        let transitionResult: StateTransition;
        try {
            transitionResult = session.advanceToNextPhase();
        } catch (error) {
            throw new Error(`Transición inválida: ${error.message}`);
        }

        // 4. MANEJAR TRANSICIÓN SEGÚN TIPO
        switch (transitionResult.state) {
            case StateTransitionsTypes.TRANSITION_TO_QUESTION:
                return await this.handleToQuestion(session, quiz);

            case StateTransitionsTypes.TRANSITION_TO_RESULTS:
                return await this.handleToResults(session, quiz);

            case StateTransitionsTypes.TRANSITION_TO_END:
                return await this.handleToEnd(session);

            default:
                throw new Error('Transición de estado no reconocida');
        }
    }

    // --- MÉTODOS PRIVADOS ---

    /**
     * Manejar transición a QUESTION (siguiente pregunta)
     */
    private async handleToQuestion(session: MultiplayerSession, quiz: Quiz): Promise<QuestionStartedResponseDto> {
        try {
            // 1. Obtener respuesta de la siguiente pregunta
            const questionResponse = await MapToQuestionResponse(session, quiz);
            
            // 2. No necesitamos persistir cambios porque el session está en memoria
            // y ya fue modificado por advanceToNextPhase() y updateProgressAndRankingService.execute()
            
            // 3. Retornar respuesta según especificación de API
            return {
                type: HostNextPhaseType.QUESTION_STARTED,
                data: {
                    state: SessionStateType.QUESTION,
                    currentSlideData: questionResponse.data.currentSlideData
                }
            };
            
        } catch (error) {
            throw new Error(`Error al avanzar a QUESTION: ${error.message}`);
        }
    }

    /**
     * Manejar transición a RESULTS (mostrar resultados de pregunta)
     */
    private async handleToResults(session: MultiplayerSession, quiz: Quiz): Promise<QuestionResultsResponseDto> {
        try {
            // 1. Usar el mapper existente para generar resultados
            const resultsResponse = MapEntriesToResultsResponse(session, quiz);
            
            // 2. No necesitamos persistir cambios porque el session está en memoria
            // y ya fue modificado por advanceToNextPhase() y updateProgressAndRankingService.execute()
            
            // 3. Retornar respuesta según especificación de API
            return {
                type: HostNextPhaseType.QUESTION_RESULTS,
                hostData: resultsResponse.hostData,
                playerData: resultsResponse.playerData
            };
            
        } catch (error) {
            throw new Error(`Error al avanzar a RESULTS: ${error.message}`);
        }
    }

    /**
     * Manejar transición a END (finalizar juego)
     */
    private async handleToEnd(session: MultiplayerSession): Promise<GameEndedResponseDto> {
        try {
            // CRÍTICO: Generar respuesta ANTES de archivar
            // Una vez archivado, la sesión se valida y puede ser invalidada
            const finalScoreboard = MapFinalScoreboard(session);
            
            // CRÍTICO: Archivar valida invariantes
            await this.sessionArchiverService.archiveAndClean(session);
            
            // Retornar respuesta según especificación de API
            return {
                type: HostNextPhaseType.GAME_END,
                hostData: finalScoreboard.hostData,
                playerData: finalScoreboard.playerData
            };
            
        } catch (error) {
            throw new Error(`Error al finalizar juego: ${error.message}`);
        }
    }

}