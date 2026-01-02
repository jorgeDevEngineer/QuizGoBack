import { SinglePlayerGameId } from "src/lib/shared/domain/ids";

export class GetCompletedQuizSummary {
    constructor(public readonly gameId: SinglePlayerGameId
    ){}
}