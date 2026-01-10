import { Quiz } from "src/lib/kahoot/domain/entity/Quiz";
import { MultiplayerSession } from "../../domain/aggregates/MultiplayerSession";
import { QuestionResultsPlayerResponseDto } from "../responseDtos/QuestionResultResponses.dto";
import { QuestionResultsResponseDto } from "../responseDtos/QuestionResultResponses.dto";
import { HostNextPhaseType } from "../responseDtos/enums/HostNextPhaseType.enum";
import { GetOptionsIdsAndCorrectAnswers } from "../helpers/GetOptionsIdsAndCorrectAnswers";
import { MapHostResultsData } from "../helpers/MapHostResultsData";
import { MapPlayerResultsData } from "../helpers/MapPlayerResultsData";

export const MapEntriesToResultsResponse = ( session: MultiplayerSession, quiz: Quiz ): QuestionResultsResponseDto => {

    // Primero Obtenemos la slide previa en la sesión o la actual si el progreso nos dice que no hay más slides disponibles
    const questionId = session.hasMoreQuestionsToAnswer() ? session.getPreviousQuestionInSession() : session.getCurrentQuestionInSession()
      

    if( !questionId ){
        throw new Error('No se encontró la questionId');
    }

    // Luego mapeamos las respuestas correctas de la slide previa   
    const { correctAnswerId, optionsId } = GetOptionsIdsAndCorrectAnswers( quiz, questionId );
    
    // Ahora mapeamos todo lo referente al scoreboard y las stats para el host
    const hostData = MapHostResultsData( session, questionId, { correctAnswerId, optionsId } );        

    // Ahora mapeamos la info de cada jugador
    const entries = session.getPlayersLeaderboardEntries();
    const playerData: Map<string, QuestionResultsPlayerResponseDto> = new Map();

    entries.forEach( entry => {
        const entryDataMapped = MapPlayerResultsData( session, questionId, entry, { correctAnswerId, optionsId } );        

        playerData.set( entry.getPlayerId().getId() , entryDataMapped );
    })

    return {
        type: HostNextPhaseType.QUESTION_RESULTS,
        hostData: {
            ...hostData
        },
        playerData: playerData
    };

}