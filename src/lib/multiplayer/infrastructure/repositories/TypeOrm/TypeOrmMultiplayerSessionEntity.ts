import { Column, PrimaryColumn, Entity } from "typeorm";
import { MultiplayerSession } from "src/lib/multiplayer/domain/aggregates/MultiplayerSession";
import { MultiplayerSessionId } from "src/lib/shared/domain/ids";
import { QuizId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { Optional } from "src/lib/shared/Type Helpers/Optional";
import { 
    SessionPin,
    SessionState,
    SessionStateType,
    Leaderboard,
    LeaderboardEntry,
    SessionProgress,
    MultiplayerQuestionResult,
    MultiplayerAnswer
} from "src/lib/multiplayer/domain/valueObjects/multiplayerVOs";
import { Player } from "src/lib/multiplayer/domain/entities/Player";
import { PlayerId, PlayerNickname } from "src/lib/multiplayer/domain/valueObjects/playerVOs";
import { GameScore } from "src/lib/shared/domain/valueObjects";
import { QuestionId } from "src/lib/kahoot/domain/valueObject/Question";

interface LeaderboardEntryJSON {
    playerId: string;
    nickname: string;
    score: number;
    rank: number;
    previousRank: number;
}

interface PlayerJSON {
    playerId: string;
    nickname: string;
    score: number;
    streak: number;
    isGuest: boolean;
}

interface MultiplayerAnswerJSON {
    playerId: string;
    questionId: string;
    answerIndex: number[];
    isCorrect: boolean;
    earnedScore: number;
    timeElapsed: number;
}

interface MultiplayerQuestionResultJSON {
    questionId: string;
    answers: MultiplayerAnswerJSON[];
}

@Entity('multiplayerSessions')
export class TypeOrmMultiplayerSessionEntity {

    @PrimaryColumn()
    sessionId: string;

    @Column()
    hostId: string;

    @Column()
    quizId: string;

    @Column()
    sessionPin: string;

    @Column('timestamp')
    startedAt: Date;

    @Column('timestamp')
    completedAt: Date;

    @Column('timestamp')
    currentQuestionStartTime: Date;

    @Column({ type: 'enum', enum: SessionStateType })
    sessionState: SessionStateType;

    @Column('json', { default: () => "'[]'" })
    leaderboard: LeaderboardEntryJSON[];

    @Column('json')
    progress: {
        currentQuestion: string;
        previousQuestion: string | null;
        totalQuestions: number;
        questionsAnswered: number;
    };

    @Column('json', { default: () => "'[]'" })
    players: PlayerJSON[];

    @Column('json', { default: () => "'[]'" })
    playersAnswers: MultiplayerQuestionResultJSON[];

    public toDomain(): MultiplayerSession {
        // Convertir players JSON a Map<PlayerId, Player>
        const playersMap = new Map<string, Player>();
        this.players.forEach(playerJson => {
            const player = Player.create(
                PlayerId.of(playerJson.playerId),
                PlayerNickname.create(playerJson.nickname),
                GameScore.create(playerJson.score),
                playerJson.streak,
                playerJson.isGuest,
            );
            playersMap.set(playerJson.playerId, player);
        });

        // Convertir playersAnswers JSON a Map<QuestionId, MultiplayerQuestionResult>
        const answersMap = new Map<string, MultiplayerQuestionResult>();
        this.playersAnswers.forEach(resultJson => {
            const questionId = QuestionId.of(resultJson.questionId);
            
            // Convertir answers JSON a Map<PlayerId, MultiplayerAnswer>
            const answersMapForQuestion = new Map<string, MultiplayerAnswer>();
            resultJson.answers.forEach(answerJson => {
                const answer = MultiplayerAnswer.create(
                    PlayerId.of(answerJson.playerId),
                    QuestionId.of(answerJson.questionId),
                    answerJson.answerIndex,
                    answerJson.isCorrect,
                    GameScore.create(answerJson.earnedScore),
                    answerJson.timeElapsed
                );
                answersMapForQuestion.set(answerJson.playerId, answer);
            });

            // Crear MultiplayerQuestionResult 
            const questionResult = MultiplayerQuestionResult.fromMap(questionId, answersMapForQuestion);
            answersMap.set(resultJson.questionId, questionResult);
        });

        // Convertir leaderboard JSON a Leaderboard
        const leaderboardEntries:LeaderboardEntry[] = this.leaderboard.map(entryJson => 
            LeaderboardEntry.create(
                PlayerId.of(entryJson.playerId),
                PlayerNickname.create(entryJson.nickname),
                GameScore.create(entryJson.score),
                entryJson.rank,
                entryJson.previousRank
            )
        );
        const leaderboard = Leaderboard.fromMap(leaderboardEntries);

        // Convertir progress JSON a SessionProgress
        const progress = SessionProgress.create(
            QuestionId.of(this.progress.currentQuestion),
            this.progress.previousQuestion ? new Optional<QuestionId>(QuestionId.of(this.progress.previousQuestion)) : new Optional<QuestionId>(undefined),
            this.progress.totalQuestions,
            this.progress.questionsAnswered
        );

        return MultiplayerSession.fromDb(
            MultiplayerSessionId.of(this.sessionId),
            UserId.of(this.hostId),
            QuizId.of(this.quizId),
            SessionPin.create(this.sessionPin),
            new Date(this.startedAt),
            new Optional<Date>(new Date (this.completedAt)),
            new Date(this.currentQuestionStartTime),
            SessionState.createAsAny(this.sessionState),
            leaderboard,
            progress,
            playersMap,
            answersMap
        );
    }

    public static fromDomain(session: MultiplayerSession): TypeOrmMultiplayerSessionEntity {
        const entity = new TypeOrmMultiplayerSessionEntity();
        
        entity.sessionId = session.getId().getId();
        entity.hostId = session.getHostId().getValue();
        entity.quizId = session.getQuizId().getValue();
        entity.sessionPin = session.getSessionPin();
        entity.startedAt = session.getStartingDate();
        entity.completedAt = session.getCompletionDate();
        entity.currentQuestionStartTime = session.getCurrentQuestionStartTime();
        entity.sessionState = session.getSessionStateType();

        // Convertir leaderboard
        entity.leaderboard = session.getPlayersLeaderboardEntries().map(entry => ({
            playerId: entry.getPlayerId().getId(),
            nickname: entry.getNickname().getNickname(),
            score: entry.getScore().getScore(),
            rank: entry.getRank(),
            previousRank: entry.getPreviousRank()
        }));

        // Convertir progress
        const progress = session.getSessionProgress();
        entity.progress = {
            currentQuestion: progress.getCurrentQuestion().getValue(),
            previousQuestion: progress.getPreviousQuestion()?.getValue() || null,
            totalQuestions: progress.getTotalQuestions(),
            questionsAnswered: progress.getQuestionsAnswered()
        };

        // Convertir players (necesitas getters en Player)
        entity.players = session.getPlayers().map(player => ({
            playerId: player.getId().getId(),
            nickname: player.getNickname().getNickname(),
            score: player.getScore().getScore(),
            streak: player.getStreak(),
            isGuest: player.getIsGuest(),
        }));

        // Convertir playersAnswers
        entity.playersAnswers = session.getMultiplayerQuestionsResults().map(result => ({
            questionId: result.getQuestionId().getValue(),
            answers: result.getPlayersAnswers().map(answer => ({
                playerId: answer.getPlayerId().getId(),
                questionId: answer.getQuestionId().getValue(),
                answerIndex: answer.getAnswerIndex(),
                isCorrect: answer.getIsCorrect(),
                earnedScore: answer.getEarnedScore(),
                timeElapsed: answer.getTimeElapsed()
            }))
        }));

        return entity;
    }
}