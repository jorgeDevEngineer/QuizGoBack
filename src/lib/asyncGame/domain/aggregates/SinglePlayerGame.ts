import {
    SinglePlayerGameId,
    GameProgress,
    GameScore,
    Optional,
    QuestionResult
} from "../valueObjects/asyncGamesVO";
import { QuizId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";


export class SinglePlayerGame {

    private readonly gameId: SinglePlayerGameId;
    private readonly quizId: QuizId;
    private readonly playerId: UserId;
    private currentScore: GameScore;
    private currentProgress: GameProgress;
    private readonly startedAt: Date;
    private completedAt: Optional<Date>
    private questionAnswers: QuestionResult[];
    
}
