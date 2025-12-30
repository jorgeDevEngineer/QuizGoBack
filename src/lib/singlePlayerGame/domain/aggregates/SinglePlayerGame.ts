import {
    SinglePlayerGameId,
    GameProgress,
    GameScore,
    QuestionResult
} from "../valueObjects/SinglePlayerGameVOs";
import { QuestionId } from "src/lib/kahoot/domain/valueObject/Question";
import { QuizId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { Optional } from "src/lib/shared/Type Helpers/Optional";

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
        private questionsResults: QuestionResult[]
    ) {}

    public getGameId(): SinglePlayerGameId { return this.gameId; }
    public getQuizId(): QuizId { return this.quizId; }
    public getPlayerId(): UserId { return this.playerId; }
    public getProgress(): GameProgress { return this.gameProgress; }
    public getScore(): GameScore { return this.gameScore; }
    public getQuestionsResults(): QuestionResult[] { return this.questionsResults; }
    public getStartedAt(): Date { return this.startedAt; }
    public getCompletedAt(): Optional<Date> { return this.completedAt; }
    public getTotalQuestions(): number { return this.totalQuestions; }

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
        questionsResults: QuestionResult[]
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
            questionsResults
        );
    }


    private updateScore(questionResult: QuestionResult): void {
        this.gameScore = this.gameScore.add(questionResult.getEvaluatedAnswer().getPointsEarned());
    }

    private updateProgress(): void {
        const progressPercentage = Math.round((this.questionsResults.length / this.totalQuestions) * 100);
        this.gameProgress = GameProgress.create(progressPercentage);

        if (this.gameProgress.isCompleted()){
            this.completeGame();
        }
    }

    public completeGame():void {
        if (!this.isComplete()) {
            throw new Error('Game is not yet completed');
        }
        this.completedAt = new Optional<Date>(new Date());
    }

    public isComplete(): boolean {
        return this.gameProgress.isCompleted();
    }

    public getCorrectAnswersCount(): number {
        return this.questionsResults.filter(result => result.getEvaluatedAnswer().getWasCorrect()).length;
    }

    public submitGameAnswer(questionResult: QuestionResult): void {

        if (this.isComplete()) {
            throw new Error('Cannot submit answers to a completed game');
        }

        const alreadyAnswered = this.questionsResults.some(
            result => result.getQuestionId() === (questionResult.getQuestionId())
        );   
        if (alreadyAnswered) {
            throw new Error('La pregunta ya ha sido respondida');
        }

        this.questionsResults.push(questionResult);
        this.updateScore(questionResult);
        this.updateProgress();
    }

    public findNextQuestionId(ids: QuestionId[]): Optional<QuestionId> {
        const idsRespondidos:string[] = this.questionsResults.map( result => {
            return result.getQuestionId().getValue();
        });

        for (const id of ids) {
            if (!idsRespondidos.includes(id.getValue())){
                return new Optional<QuestionId>(id);
            }
        }
        return new Optional<QuestionId>();
    }

    public hasAnsweredQuestion(id: QuestionId): boolean{
        return this.questionsResults.some( result => result.getQuestionId().equals(id) )
    }
    
}
