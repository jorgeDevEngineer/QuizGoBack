import { GameScore } from "src/lib/shared/domain/valueObjects";
import { PlayerId } from "../valueObjects/playerVOs";
import { Player } from "../entities/Player";
import { validateNicknameInvariants } from "../helpers/NicknameInvariants";
import { PlayerNickname } from "../valueObjects/playerVOs";

export class PlayerFactory {

    public static createPlayerForSession(
        userId: string,
        nickname: string,
        isGuest: boolean,
    ): Player {

        const { cleanNickname, isValid, error } = validateNicknameInvariants( nickname );

        if( !isValid ) {
            throw new Error( error );
        }

        const playerId = PlayerId.of(userId);  
        const baseScore = GameScore.create(0);
        const TrueNickname = PlayerNickname.create(cleanNickname);

        return Player.create( playerId , TrueNickname, baseScore, 0, isGuest );

    }

}