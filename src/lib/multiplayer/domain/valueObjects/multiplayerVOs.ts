import { GameScore } from "src/lib/shared/domain/valueObjects";
import { PlayerId, PlayerNickname } from "./playerVOs";
import { Player } from "../entities/Player";
import { QuestionId } from "src/lib/kahoot/domain/valueObject/Question";
import { Optional } from "src/lib/shared/Type Helpers/Optional";

/**
 * Encapsula el PIN de una sesión de multijugador
 */
export class SessionPin {

    private constructor(private readonly pin:string){
        if(!SessionPin.isPinValid(pin) ){
            throw new Error('El pin debe tener de 6 a 10 dígitos');
        } 
    }

    public static create(pin:string):SessionPin { 
        return new SessionPin(pin);
    }

    public static isPinValid(pin:string): boolean {
        const pinRegex = /^\d{6,10}$/;
        return pinRegex.test(pin);
    }

    public getPin(): string {
        return this.pin;
    }

}

/**
 * Encapsula la entrada del Leaderboard de jugadores en una sesión multijugador (cada entrada corresponde a un jugador)
 */
export class LeaderboardEntry {

    private constructor (
        private readonly playerId: PlayerId,
        private readonly playerNickname: PlayerNickname,
        private readonly playerScore: GameScore,
        private readonly rank: number,
        private readonly previousRank: number
    ){
        if(!Number.isInteger(rank)){
            throw new Error('El número de ranking debe ser un número entero');
        }
        if(rank<= 0){
            throw new Error('El número de ranking debe ser un número mayor a 0');
        }
    }

    public static create(
        playerId: PlayerId,
        playerNickname: PlayerNickname,
        playerScore: GameScore,
        rank: number,
        previousRank: number
    ): LeaderboardEntry {
        return new LeaderboardEntry(playerId, playerNickname, playerScore, rank, previousRank)
    }

    public getPlayerId(): PlayerId {
        return this.playerId;
    }

    public getNickname(): PlayerNickname {
        return this.playerNickname;
    }

    public getScore(): GameScore {
        return this.playerScore
    }

    public getRank(): number{
        return this.rank;
    }

    public getPreviousRank(): number{
        return this.previousRank;
    }
}

/**
 * Encapsula el leaderboard de una sesión multijugador en un momento concreto de la partida
 */
export class Leaderboard {

    private constructor(private readonly entries: LeaderboardEntry[]) {}

    //Crear vacio
    public static create(): Leaderboard {
        return new Leaderboard([]);
    }

    public static fromMap(entradas: LeaderboardEntry[]): Leaderboard {
        return new Leaderboard(entradas);
    }

    public updateLeaderboard( players: Player[] ): Leaderboard {

        const previousRanks = this.entries.map( entry =>({ id: entry.getPlayerId().getId(), previousRank: entry.getRank() }));
        
        const entries = players
                            .sort((p1,p2) => p2.getScore().getScore() - p1.getScore().getScore() )
                            .map(( player, index )  => {

                                let oldRank: number = 0;

                                for( const rank of previousRanks ){
                                    if( rank.id === player.getId().getId() ){
                                        oldRank = rank.previousRank;
                                    }
                                }

                                return LeaderboardEntry.create(
                                    player.getId(),
                                    player.getNickname(),
                                    player.getScore(),
                                    index + 1, 
                                    oldRank
                                )

                            });
        return new Leaderboard(entries);
    };

    public addLeaderboardEntry( player: Player ): Leaderboard {

        const playerEntries: LeaderboardEntry[] = [];

        playerEntries.push( LeaderboardEntry.create(
                                    player.getId(),
                                    player.getNickname(),
                                    player.getScore(),
                                    1,
                                    0 
                            ));

        this.entries.forEach( entry => {
            playerEntries.push( entry );     
        });

        return new Leaderboard(playerEntries);
        
    };

     public getTop(limit: number): LeaderboardEntry[] {
        return this.entries.slice(0, limit);
    }
    
    public getEntryFor(playerId: PlayerId ): LeaderboardEntry {
        const entry = this.entries.find( entry => entry.getPlayerId().equals( playerId ));
        if( !entry ){
            throw new Error('El jugador solicitado no se encuentra en el ranking o en la partida')
        }
        return entry;
    }

    public getEntries(): LeaderboardEntry[] {
        return this.entries;
    }

}

/**
 * Encapsula el progreso de una sesión multijugador
 */
export class SessionProgress {

    private constructor(
        private readonly currentQuestion: QuestionId,
        private readonly previousQuestion: Optional<QuestionId>,
        private readonly totalQuestions: number,
        private readonly questionsAnswered: number
    ){
        if( !Number.isInteger( totalQuestions) || !Number.isInteger( questionsAnswered )){
            throw new Error('El numero de totalQuestions o el numero de questionsAnswered dado no es un número entero');
        }
        if( totalQuestions < 1 ){
            throw new Error('El número de preguntas en total es menor a 1');
        }
        if( questionsAnswered < 0 ){
            throw new Error('El número de preguntas respondidas es menor a 0');
        }
    }

    public static create(
        currentQuestion: QuestionId,
        previousQuestion: Optional<QuestionId>,
        totalQuestions: number,
        questionsAnswered: number
    ): SessionProgress {
        return new SessionProgress(currentQuestion, previousQuestion, totalQuestions, questionsAnswered);
    }

     public addQuestionAnswered(nextQuestion:QuestionId): SessionProgress {
        if(!this.hasMoreQuestionsToAnswer())
            return this; 
        return new SessionProgress( 
            nextQuestion,
            new Optional( this.currentQuestion ),
            this.totalQuestions, 
            this.questionsAnswered + 1 
        );
    }

     public completeProgress( ): SessionProgress {
        if(this.hasMoreQuestionsToAnswer()){ //La ultima por responder que sería mi actual
            return new SessionProgress( 
                this.currentQuestion,
                this.previousQuestion,
                this.totalQuestions, 
                this.questionsAnswered + 1 
            );
        } 
        return this;
    }

     public getProgressPercentage(): number {
        return ( this.questionsAnswered*100 ) / this.totalQuestions; 
    }

    public hasMoreQuestionsToAnswer(): boolean {
        return this.questionsAnswered < this.totalQuestions; 
    }


    public getHowManyQuestionsAreLeft(): number{
        return this.totalQuestions - this.questionsAnswered; 
    }

    public getQuestionsAnswered(): number {
        return this.questionsAnswered;
    }


    public getTotalQuestions(): number {
        return this.totalQuestions;
    }

    public getCurrentQuestion(): QuestionId {
        return this.currentQuestion;
    }

    public getPreviousQuestion(): QuestionId | undefined {
        if( !this.previousQuestion.hasValue() ){
            return undefined
        }
        return this.previousQuestion.getValue();
    }
}

/**
 * Enum para los 4 posibles estados de una sesión multijugador
 */
export enum SessionStateType {

    LOBBY = "lobby",
    QUESTION  = "question",
    RESULTS  = "results",
    END = "end",
    
}

/**
 * Encapsula el estado de una sesión multijugador
 */
export class SessionState {

    private constructor (private readonly state:SessionStateType) {}

    public isLobby(): boolean {
        return this.state === SessionStateType.LOBBY;
    };

    public isQuestion(): boolean {
        return this.state === SessionStateType.QUESTION;
    };    

    public isResults(): boolean {
        return this.state === SessionStateType.RESULTS;
    };

    public isEnd(): boolean {
        return this.state === SessionStateType.END;
    };

    public canTransitionTo( target: SessionStateType ): boolean {
        switch( target ){
            case(SessionStateType.LOBBY):
                return false;

            case(SessionStateType.QUESTION ): {
                if( this.state === SessionStateType.LOBBY || this.state === SessionStateType.RESULTS ){
                    return true;
                }
                return false;
            };
            
            case( SessionStateType.RESULTS ): {
                if( this.state === SessionStateType.QUESTION ){
                    return true;
                }
                return false;
            };

            case( SessionStateType.END ): {
                if( this.state === SessionStateType.RESULTS ){
                    return true
                }
            };

            default:
                return false
        };

    };

    public static createAsLobby(): SessionState {
        return new SessionState( SessionStateType.LOBBY );
    }

    public static createAsAny(state: SessionStateType): SessionState {
        return new SessionState(state);
    }

    public toQuestion(): SessionState {
        if( this.canTransitionTo( SessionStateType.QUESTION ) ){
            return new SessionState(SessionStateType.QUESTION);
        }
        throw new Error(`No se puede pasar al estado QUESTION desde el estado ${this.state}`);
    };

    public toResults(): SessionState {
        if( this.canTransitionTo( SessionStateType.RESULTS ) ){
            return new SessionState(SessionStateType.RESULTS);
        }
        throw new Error(`No se puede pasar al estado RESULTS desde el estado ${this.state}`);

    };

    public toEnd(): SessionState {
        if( this.canTransitionTo( SessionStateType.END ) ){
            return new SessionState( SessionStateType.END );
        }
        throw new Error(`No se puede pasar al estado END desde el estado ${this.state}`);

    };

    public getState(): SessionStateType {
        return this.state 
    }

}

/**
 * Encapsula la respuesta de un jugador en una sesión multijugador
 */
export class MultiplayerAnswer {

    private constructor(
        private readonly playerId: PlayerId,
        private readonly questionId: QuestionId,
        private readonly answerIndex: number[],
        private readonly isCorrect: boolean,
        private readonly earnedScore: GameScore,
        private readonly timeElapsed: number,
    ) {}

    public static create(
        playerId: PlayerId,
        questionId: QuestionId,
        answerIndex: number[],
        isCorrect: boolean,
        earnedScore: GameScore,
        timeElapsed: number,
    ): MultiplayerAnswer {
        return new MultiplayerAnswer(playerId, questionId, answerIndex, isCorrect, earnedScore, timeElapsed);
    }

    public didPlayerAnswer(): boolean {
        return this.answerIndex.length > 0;
    }

    public getIsCorrect(): boolean {
        return this.isCorrect;
    }

    public getPlayerId(): PlayerId {
        return this.playerId;
    }

    public getQuestionId(): QuestionId {
        return this.questionId;
    }

    public getAnswerIndex(): number[] {
        return this.answerIndex;
    }

    public getEarnedScore(): number {
        return this.earnedScore.getScore();
    }

    public getTimeElapsed(): number {
        return this.timeElapsed;
    }

}

/**
 * Encapsula el resultado de una pregunta en una sesión multijugador
 */
export class MultiplayerQuestionResult {

    private constructor(
        private readonly questionId: QuestionId,
        private readonly answers: Map<string, MultiplayerAnswer> //PlayerId ---> Respuesta
    ){}

    public static create(questionId: QuestionId): MultiplayerQuestionResult {
        const answers: Map<string, MultiplayerAnswer> = new Map();
        return new MultiplayerQuestionResult(questionId, answers);
    }

    public static fromMap(questionId: QuestionId, answers:Map<string, MultiplayerAnswer>): MultiplayerQuestionResult{
        return new MultiplayerQuestionResult(questionId, answers);
    }

    public addResult(playerAnswer:MultiplayerAnswer): MultiplayerQuestionResult {

        if(this.answers.has(playerAnswer.getPlayerId().getId())){
            throw Error('El jugador ya tiene una respuesta asociada a esta pregunta, no puede añadir otra');
        }
            
        const updatedAnswers: Map<string, MultiplayerAnswer> = new Map();

        for( const [playerId, playerAnswer] of this.answers ){
            updatedAnswers.set( playerId, playerAnswer );
        }

        updatedAnswers.set(playerAnswer.getPlayerId().getId(), playerAnswer);

        return new MultiplayerQuestionResult(this.questionId,updatedAnswers);
    }

    public searchPlayerAnswer(playerId: PlayerId ): MultiplayerAnswer | undefined {
        if(!this.answers.has(playerId.getId())){
            return undefined;
        }
        return this.answers.get(playerId.getId())!;
    }

    public getQuestionId(): QuestionId {
        return this.questionId;
    }

    public getPlayersAnswers(): MultiplayerAnswer[] {
        return [ ...this.answers.values() ];
    }

}

export enum StateTransitionsTypes {
    TRANSITION_TO_QUESTION = "transition_to_question",
    TRANSITION_TO_RESULTS = "transition_to_results",
    TRANSITION_TO_END = "transition_to_end",
}

export type StateTransition = { state: StateTransitionsTypes }
