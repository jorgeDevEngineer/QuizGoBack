import { PlayerId, PlayerNickname } from "../valueObjects/multiplayerVOs";
import { GameScore } from "src/lib/shared/domain/valueObjects";

export class Player {

    private constructor(
        private readonly id: PlayerId,
        private nickname: PlayerNickname,
        private score: GameScore,
        private streak: number = 0,
        private readonly isGuest: boolean
    ) {}

    public newNickname(nickname:string): void {
        const newNickname:PlayerNickname = PlayerNickname.create(nickname);
        this.nickname = newNickname;
    }

    public newScore(score:number): void {
        const newScore:GameScore = GameScore.create(score);
        this.score = newScore;
    }

    public updateStreak(lastAnswerWasCorrect: boolean): void {
        if( lastAnswerWasCorrect ){
            this.streak++
        }else{
            this.streak = 0;
        }
    }

    public getId(): PlayerId {
        return this.id;
    }

    public getNickname(): PlayerNickname {
        return this.nickname;
    }

    public getScore(): GameScore {
        return this.score;
    }

    public getStreak(): number {
        return this.streak;
    }

    public getIsGuest(): boolean {
        return this.isGuest;
    }

}