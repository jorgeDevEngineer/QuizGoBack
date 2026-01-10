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