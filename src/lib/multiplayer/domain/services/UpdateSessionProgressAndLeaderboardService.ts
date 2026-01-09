import { Quiz } from "src/lib/kahoot/domain/entity/Quiz";
import { MultiplayerSession } from '../aggregates/MultiplayerSession';

export class UpdateSessionProgressAndLeaderboardService {
    
    public execute(quiz: Quiz, session: MultiplayerSession): void {

        const questionId = session.getCurrentQuestionInSession();

        const questionResult = session.getQuestionResultsByQuestionId( questionId );

        session.updatePlayersScores( questionResult );

        session.updateLeaderboard();

        const nextQuestion = quiz.getNextQuestionByIndex( session.getCurrentQuestionIndex() );

        if( nextQuestion ){
            session.updateProgress( nextQuestion.id ); 
            session.startQuestionResults( nextQuestion.id);

        }else{
            session.completeProgess(); 
        };
          
    }

}