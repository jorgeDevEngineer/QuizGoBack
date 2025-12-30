import { Column, Entity, PrimaryColumn } from 'typeorm';
import { SinglePlayerGame } from '../../domain/aggregates/SinglePlayerGame';
import { 
    EvaluatedAnswer, 
    GameProgress, 
    GameProgressStatus, 
    GameScore,  
    PlayerAnswer, 
    QuestionResult, 
    QuestionResultJSON, 
    SinglePlayerGameId
} from '../../domain/valueObjects/SinglePlayerGameVOs';
import { QuestionId } from 'src/lib/kahoot/domain/valueObject/Question';
import { QuizId, UserId } from 'src/lib/kahoot/domain/valueObject/Quiz';
import { Optional } from "src/lib/shared/Type Helpers/Optional";

@Entity('asyncgame')
export class TypeOrmSinglePlayerGameEntity {

    @PrimaryColumn()
    gameId:string;

    @Column()
    quizId:string;

    @Column()
    totalQuestions:number;

    @Column()
    playerId:string;

    @Column({type: 'enum', enum: GameProgressStatus})
    status:GameProgressStatus;

    @Column()
    progress:number;

    @Column()
    score:number;

    @Column('timestamp')
    startedAt: Date;

    @Column('timestamp', { nullable: true })
    completedAt: Date | null;

    @Column('json', { default: () => "'[]'" })
    questionResults: QuestionResultJSON[];

    public toDomain(): SinglePlayerGame {
        const questionResults: QuestionResult[] = this.questionResults.map(questionResultJson => {
            
            const playerAnswer = PlayerAnswer.create(
                QuestionId.of(questionResultJson.questionId),
                questionResultJson.answerIndex,
                questionResultJson.timeUsedMs
            );

            const evaluatedAnswer = EvaluatedAnswer.create(
                questionResultJson.wasCorrect,
                questionResultJson.pointsEarned
            );

            return QuestionResult.create(
                QuestionId.of(questionResultJson.questionId),
                playerAnswer,
                evaluatedAnswer
            );
        });

        return SinglePlayerGame.fromDb(
            SinglePlayerGameId.of(this.gameId),
            QuizId.of(this.quizId),
            this.totalQuestions,
            UserId.of(this.playerId),
            GameProgress.create(this.progress),
            GameScore.create(this.score),
            new Date(this.startedAt),
            new Optional<Date>(this.completedAt ? new Date(this.completedAt) : undefined),
            questionResults
        );
    } 

    public static fromDomain(game: SinglePlayerGame): TypeOrmSinglePlayerGameEntity {
        const entity = new TypeOrmSinglePlayerGameEntity();
        entity.gameId = game.getGameId().getId();
        entity.quizId = game.getQuizId().getValue();
        entity.totalQuestions = game.getTotalQuestions();
        entity.playerId = game.getPlayerId().getValue();
        entity.status = game.getProgress().getStatus();
        entity.progress = game.getProgress().getProgress();
        entity.score = game.getScore().getScore();
        entity.startedAt = game.getStartedAt();
        entity.completedAt = game.getCompletedAt().hasValue() ? game.getCompletedAt().getValue() : null;
        
        entity.questionResults = game.getQuestionsResults().map(result => {
            const playerAnswer = result.getPlayerAnswer();
            const evaluatedAnswer = result.getEvaluatedAnswer();

            return {
                questionId: result.getQuestionId().getValue(),
                answerIndex: playerAnswer.getAnswer(),
                timeUsedMs: playerAnswer.getTimeUsed(),
                wasCorrect: evaluatedAnswer.getWasCorrect(),
                pointsEarned: evaluatedAnswer.getPointsEarned()
            };
        });
        
        return entity;
    }
}