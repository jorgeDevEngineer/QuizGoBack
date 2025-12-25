import { SinglePlayerGameId } from "src/lib/singlePlayerGame/domain/valueObjects/SinglePlayerGameVOs";

export class GetCompletedQuizSummary {
    constructor(public readonly gameId: SinglePlayerGameId
    ){}
}