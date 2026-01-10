import { Quiz } from "src/lib/kahoot/domain/entity/Quiz";
import { MultiplayerSession } from "../../domain/aggregates/MultiplayerSession";
import { PlayerId } from "../../domain/valueObjects/playerVOs";
import { SyncStateResponseDto } from "../responseDtos/SyncStateResponse.dto";
import { SyncStateCommand } from "../parameterObjects/SyncStateCommand";
import { SyncType } from "../responseDtos/enums/SyncType.enum";
import { IsHost } from "../helpers/isHost";
import { GetOptionsIdsAndCorrectAnswers } from "../helpers/GetOptionsIdsAndCorrectAnswers";
import { MapHostResultsData } from "../helpers/MapHostResultsData";
import { MapPlayerResultsData } from "../helpers/MapPlayerResultsData";
import { COMMON_ERRORS } from "../handlers/Errors/CommonErrors";

export const MapResultsToSyncState = ( 
    session: MultiplayerSession, 
    quiz: Quiz,
    userInfo: SyncStateCommand 
): SyncStateResponseDto => {
    
    // Primero Obtenemos la slide previa en la sesión o la actual si el progreso nos dice que no hay más slides disponibles
    const questionId = session.hasMoreQuestionsToAnswer() ? session.getPreviousQuestionInSession() : session.getCurrentQuestionInSession()

    if( !questionId ){
        throw new Error(COMMON_ERRORS.PREVIOUS_SLIDE_NOT_FOUND);
    }

    // mapeamos las respuestas correctas de la slide previa   
    const { correctAnswerId, optionsId } = GetOptionsIdsAndCorrectAnswers( quiz, questionId );

    if( IsHost( userInfo.userId , session.getHostId().value ) ) {

        const hostData = MapHostResultsData( session, questionId, { correctAnswerId, optionsId } );        
        return { type: SyncType.HOST_RESULTS, data: {...hostData } };

    } else {

        const entry = session.getOnePlayerLeaderboardEntry( PlayerId.of( userInfo.userId ) );
        const playerData = MapPlayerResultsData( session, questionId, entry, { correctAnswerId, optionsId } );        
        return { type:SyncType.PLAYER_RESULTS, data: { ...playerData } };

    }

}