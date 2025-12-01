import { randomUUID, UUID } from "crypto";
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { QuestionId } from "src/lib/kahoot/domain/valueObject/Question";
import { AnswerId } from "src/lib/kahoot/domain/valueObject/Answer";

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isValidUUID(value: string): boolean {
    return UUID_V4_REGEX.test(value);
}

/**
 * El viejo y confiable Optional, nunca falla
 */
export class Optional<T> {

    private value: T | undefined;
    private assigned: boolean;

    public constructor(value?:T){
        if(value){
            this.value = value;
            this.assigned = true;
        } else {
            this.value = undefined;
            this.assigned = false;
        }
    }

    public hasValue(): boolean {
        return this.assigned;
    }

    public getValue(): T {
        if (!this.hasValue()){
            throw new Error('pelaste');
        }
        return this.value as T;
    }
}

/**
 * Encapsula un identificador para una Partida de un Kahoot (UUID v4).
 */
export class SinglePlayerGameId {
    private readonly IdGame: string;

    private constructor(private readonly gameId:string){
        this.IdGame = gameId;
        if(!isValidUUID(gameId)){
            throw new Error(`SinglePlayerGameId does not have a valid UUID v4 format: ${gameId}`);
        }
    }

    public static of(gameId: string): SinglePlayerGameId{
        return new SinglePlayerGameId(gameId);
    }

    public static generate(): SinglePlayerGameId{
        return new SinglePlayerGameId(randomUUID());
    }
    public get game(): string {
        return this.IdGame;
    }

    
}

/**
 * Enum para los estados de una Partida, en progreso o completada
 */
export enum GameProgressStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
}

/**
 * Encapsula todo lo referente al progreso de la Partida de un Kahoot, su estado actual y porcentaje de completación
 */
export class GameProgress {

    private constructor(private readonly status: GameProgressStatus, private readonly progress: number){
        if(!this.validateProgress(progress)){
            throw new Error(`The progress must be a value between 0 and 100`);
        }
    }
       
    private validateProgress(progress: number):boolean {
        return progress >= 0 && progress <= 100 ? true : false;
    }

    public static create(progress: number): GameProgress{
        if (progress == 100){
            return new GameProgress(GameProgressStatus.COMPLETED, progress);
        } else {
            return new GameProgress(GameProgressStatus.IN_PROGRESS, progress);
        }
    }

    public isCompleted(): boolean {
        return this.status === GameProgressStatus.COMPLETED;
    }

    public getProgress(): number{
        return this.progress;
    }

}

/**
 * Encapsula todo lo referente al puntaje de la Partida de un Kahoot
 */
export class GameScore {
    
    constructor (private readonly score:number) {
        if (!this.validatePoints(score)){
            throw new Error(`The score must be 0 or higher`);
        }
    }

    private validatePoints(points: number) {
        return points >= 0 ? true : false;
    }

    public static create(points: number): GameScore{
        return new GameScore(points);
    }

    public add(points: number): GameScore{
        return new GameScore(this.score + points);
    }

    public getScore():number{
        return this.score;
    }
}

/**
 * Encapsula la Respuesta de un Jugador en una Pregunta de un Kahoot
 */
export class PlayerAnswer {

    private constructor(
        private readonly playerId: UserId,
        private readonly questionId: QuestionId,     
        private readonly answer: Optional<AnswerId | AnswerId[]>,
        private readonly timeUsedMs: number           
    ) {}

    public static create(
        playerId: UserId,
        questionId: QuestionId,     
        answer: Optional<AnswerId | AnswerId[]>,
        timeUsedMs: number
    ): PlayerAnswer {
        return new PlayerAnswer(playerId, questionId, answer, timeUsedMs);
    }

    public getAnswer(): Optional<AnswerId | AnswerId[]> {
        if (!this.answer.hasValue()){
            return new Optional<AnswerId | AnswerId[]>();
        } else {
            return this.answer;
        }
    }

    public getTimeUsed(): number {
        return this.timeUsedMs;
    }

}

/**
 * Encapsula el resultado de la Evaluación de una Respuesta de un Jugador una Pregunta de un Kahoot
 */
export class EvaluatedAnswer {

    private constructor(
        private readonly playerId: UserId,
        private readonly wasCorrect: boolean,
        private readonly pointsEarned: number
    ) {}

    public static create(playerId: UserId, wasCorrect: boolean, pointsEarned: number): EvaluatedAnswer {
        return new EvaluatedAnswer(playerId, wasCorrect, pointsEarned);
    }

    public getPointsEarned(): number {
        return this.pointsEarned;
    }

    public getWasCorrect(): boolean {
        return this.wasCorrect;
    }
}

/**
 * Encapsula el resultado completo de una pregunta de un Jugador a un Kahoot, su respuesta base y su evaluación
 */
export class QuestionResult {

    private constructor(
        private readonly questionId: QuestionId,
        private readonly playerAnswer: PlayerAnswer,
        private readonly evaluatedAnswer: EvaluatedAnswer
    ) {}

    public getPlayerAnswer(): PlayerAnswer {
        return this.playerAnswer;
    }

    public getEvaluatedAnswer(): EvaluatedAnswer {
        return this.evaluatedAnswer;
    }

}