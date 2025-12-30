import { randomUUID } from "crypto";
import { QuestionId } from "src/lib/kahoot/domain/valueObject/Question";
import { Optional } from "src/lib/shared/Type Helpers/Optional";

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isValidUUID(value: string): boolean {
    return UUID_V4_REGEX.test(value);
}

/**
 * Encapsula un identificador para una Partida de un Kahoot (UUID v4).
 */
export class SinglePlayerGameId {

    private constructor(private readonly gameId:string){
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

    public getId():string{
        return this.gameId;
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

    public getStatus():GameProgressStatus {
        return this.status
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
        private readonly questionId: QuestionId,
        private readonly answerIndex: number[],
        private readonly timeUsedMs: number           
    ) {}

    public static create(questionId: QuestionId, answerIndex: number[], timeUsedMs: number): PlayerAnswer {
        return new PlayerAnswer(questionId, answerIndex, timeUsedMs);
    }

    public getAnswer(): number[] {
        return this.answerIndex;
    }

    public getTimeUsed(): number {
        return this.timeUsedMs;
    }

    public getQuestionId(): QuestionId {
        return this.questionId;
    }

}

/**
 * Encapsula el resultado de la Evaluación de una Respuesta de un Jugador una Pregunta de un Kahoot
 */
export class EvaluatedAnswer {

    private constructor(
        private readonly wasCorrect: boolean,
        private readonly pointsEarned: number
    ) {}

    public static create(wasCorrect: boolean, pointsEarned: number): EvaluatedAnswer {
        return new EvaluatedAnswer(wasCorrect, pointsEarned);
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

    public static create(questionId: QuestionId, playerAnswer: PlayerAnswer, evaluatedAnswer: EvaluatedAnswer): QuestionResult {
        return new QuestionResult(questionId, playerAnswer, evaluatedAnswer);
    }

    public getPlayerAnswer(): PlayerAnswer {
        return this.playerAnswer;
    }

    public getEvaluatedAnswer(): EvaluatedAnswer {
        return this.evaluatedAnswer;
    }

    public getQuestionId(): QuestionId {
        return this.questionId;
    }
    
}

/**
 * Interfaz para la entidad typeORM
 */
export interface QuestionResultJSON {
  questionId: string;
  answerIndex: number[];
  timeUsedMs: number;
  wasCorrect: boolean;
  pointsEarned: number;
}