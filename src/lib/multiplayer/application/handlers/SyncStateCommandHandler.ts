import { Inject } from "@nestjs/common";
import { SessionStateType } from "../../domain/valueObjects/multiplayerVOs";
import { IActiveMultiplayerSessionRepository } from "../../domain/repositories/IActiveMultiplayerSessionRepository";
import { SyncStateCommand } from "../parameterObjects/SyncStateCommand";
import { SyncStateResponseDto } from "../responseDtos/SyncStateResponse.dto";
import { MapEndToSyncState } from "../mappers/MapEndToSyncState";
import { MapLobbyToSyncState } from "../mappers/MapLobbyToSyncState";
import { MapQuestionToSyncState } from "../mappers/MapQuestionToSyncState";
import { MapResultsToSyncState } from "../mappers/MapResultsToSyncState";
import { MapToQuestionResponse } from "../mappers/MapToQuestionResponse";
import { IHandler } from "src/lib/shared/IHandler";
import { COMMON_ERRORS } from "./Errors/CommonErrors";

export class SyncStateCommandHandler implements IHandler<SyncStateCommand, SyncStateResponseDto> {

    constructor(
        @Inject( 'IActiveMultiplayerSessionRepository' )
        private readonly sessionRepository: IActiveMultiplayerSessionRepository,
    ){}

    async execute(command: SyncStateCommand): Promise<SyncStateResponseDto> {

        // Cargamos el agregado session desde el repositorio en memoria
        const sessionWrapper = await this.sessionRepository.findByPin( command.sessionPin );

        if( !sessionWrapper ){
            throw new Error(COMMON_ERRORS.SESSION_NOT_FOUND);
        }

        const { session, quiz } = sessionWrapper

        const state = session.getSessionState();

        switch( state.getState() ) {

            case( SessionStateType.LOBBY ): {
                const response = MapLobbyToSyncState( session, command );
                return response;
            }

            case( SessionStateType.QUESTION ): {
                const question = await MapToQuestionResponse( session, quiz);
                const response = MapQuestionToSyncState( session, quiz, question, command );
                return response;
            }

            case( SessionStateType.RESULTS ): {
                const response = MapResultsToSyncState( session, quiz, command );
                return response;
            }

            case( SessionStateType.END ): {
                const response = MapEndToSyncState( session, command );
                return response;
            }

        }

    }

}