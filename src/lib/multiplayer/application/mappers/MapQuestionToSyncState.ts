import { Quiz } from "src/lib/kahoot/domain/entity/Quiz";
import { MultiplayerSession } from "../../domain/aggregates/MultiplayerSession";
import { Question } from "src/lib/kahoot/domain/entity/Question";
import { PlayerId } from "../../domain/valueObjects/playerVOs";
import { QuestionStartedResponseDto } from "../responseDtos/QuestionStartedResponse.dto";
import { SyncStateResponseDto } from "../responseDtos/SyncStateResponse.dto";
import { SyncStateCommand } from "../parameterObjects/SyncStateCommand";
import { SyncType } from "../responseDtos/enums/SyncType.enum";
import { IsHost } from "../helpers/IsHost";

export const MapQuestionToSyncState = ( 
    session: MultiplayerSession, 
    quiz: Quiz,
    question: QuestionStartedResponseDto, 
    userInfo: SyncStateCommand 
): SyncStateResponseDto => {
    
    const currentSlideId = session.getCurrentQuestionInSession();
    const playerId = PlayerId.of( userInfo.userId);

    let currentQuestion: Question | null = quiz.getQuestionById( currentSlideId );
        
    // 1) Calculamos tiempo transcurrido (en Milisegundos)
    const timeElapsed = Date.now() - session.getCurrentQuestionStartTime().getTime();
    
    // 2) Convertimos el límite de la slide a Milisegundos
    const timeLimitMs = (currentQuestion?.timeLimit?.getValue() || 0) * 1000;

    // 3) Ahora la resta tiene sentido (ms - ms)
    const timeRemaining = Math.max(0, timeLimitMs - timeElapsed);
    

    const hasAnswered = !IsHost(userInfo.userId, session.getHostId().value)
                            ? session.hasPlayerAnsweredQuestion( currentSlideId, playerId )
                            : undefined; // Quiere decir que es un host, este no responde preguntas y por tanto el atributo sobra

    return {

        type: SyncType.QUESTION_STARTED,

        data: {
        
            ...question,
                    
        },

        additionalData: {
            timeRemainingMs: timeRemaining,
            hasAnswered: hasAnswered
        }
    };

}