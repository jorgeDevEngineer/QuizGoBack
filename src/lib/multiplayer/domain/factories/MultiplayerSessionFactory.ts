import { MultiplayerSession } from "../aggregates/MultiplayerSession";
import { Quiz } from "src/lib/kahoot/domain/entity/Quiz";
import { MultiplayerSessionId } from "src/lib/shared/domain/ids";
import { QuizId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { QuestionId } from "src/lib/kahoot/domain/valueObject/Question";
import { Leaderboard, SessionPin, SessionState, SessionProgress, MultiplayerQuestionResult } from "../valueObjects/multiplayerVOs";
import { PlayerId } from "../valueObjects/playerVOs";
import { Player } from "../entities/Player";
import { Optional } from "src/lib/shared/Type Helpers/Optional";

interface KahootInfo {
    kahootId: QuizId,
    firstSlideId: QuestionId,
    slidesNumber: number
}

export class MultiplayerSessionFactory {


    public static createMultiplayerSession( 
        quiz: Quiz,
        hostIdString: string,  // UserId
        sessionIdString: string, // MultiplayerSessionId
        pin: string,
    ): MultiplayerSession {

        // Lógica de creación de la info del kahoot
        // Creamos el idUser del host y verificamos que el kahoot le corresponda
        const hostId = new UserId( hostIdString );

        // Obtenemos la informacion del kahoot necesaria para construir el player session
        const questionId = QuestionId.of( (quiz.getNextQuestionByIndex()?.id!).getValue() )

        const kahootInfo: KahootInfo = {
            kahootId: quiz.id,
            firstSlideId: questionId,
            slidesNumber: quiz.getTotalQuestions(),
        }

        const sessionId = MultiplayerSessionId.of(sessionIdString);

        const sessionPin = SessionPin.create( pin );

        const initialGameState = SessionState.createAsLobby();

        const ranking = Leaderboard.create();

        const initialSessionProgress = SessionProgress.create( 
            kahootInfo.firstSlideId , 
            new Optional(), // no tiene slide previa al inicio
            kahootInfo.slidesNumber, 
            0 
        );

        const hollowPlayerMap = new Map<string, Player>();

        const hollowAnswersMap = new Map<string, MultiplayerQuestionResult>();

        const startedAt = new Date();

        const hollowCompletedAt = new Optional<Date>();

        const hollowCurrentQuestionStartTime = new Date();

        Date.now();

        return  MultiplayerSession.fromDb(
            sessionId,
            hostId,
            kahootInfo.kahootId,
            sessionPin,
            startedAt,
            hollowCompletedAt, 
            hollowCurrentQuestionStartTime,
            initialGameState,
            ranking,
            initialSessionProgress,
            hollowPlayerMap,
            hollowAnswersMap
        );

    }


}