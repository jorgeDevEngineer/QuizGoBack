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

    constructor(
        private readonly gameId: SinglePlayerGameId,
        private readonly quizId: QuizId,
        private readonly totalQuestions: number,
        private readonly playerId: UserId,
        private gameProgress: GameProgress,
        private gameScore: GameScore,
        private readonly startedAt: Date,
        private completedAt: Optional<Date>,
        private gameAnswers: QuestionResult[]
    ) {}
    

    public static create(
        gameId: SinglePlayerGameId,
        quizId: QuizId,
        totalQuestions: number,
        playerId: UserId
    ):SinglePlayerGame{
        return new SinglePlayerGame(
            gameId,
            quizId,
            totalQuestions,
            playerId,
            GameProgress.create(0),
            GameScore.create(0),
            new Date(),
            new Optional<Date>(),
            []
        );      
    }

    public static fromDb(
        gameId: SinglePlayerGameId,
        quizId: QuizId,
        totalQuestions: number,
        playerId: UserId,
        gameProgress: GameProgress,
        gameScore: GameScore,
        startedAt: Date,
        completedAt: Optional<Date>,
        gameAnswers: QuestionResult[]
    ): SinglePlayerGame {
        return new SinglePlayerGame(
            gameId,
            quizId,
            totalQuestions,
            playerId,
            gameProgress,
            gameScore,
            startedAt,
            completedAt,
            gameAnswers
        );
    }
    
}
