import { Optional } from "../../../shared/Type Helpers/Optional";
import { SinglePlayerGame } from "../../../singlePlayerGame/domain/aggregates/SinglePlayerGame";
import { Quiz } from "../../../kahoot/domain/entity/Quiz";

export type CompletedQuizResponse = {
    kahootId: string;
    gameId: string;
    gameType: 'Singleplayer' | 'Multiplayer';
    title: string;
    completionDate: Date;
    finalScore: number;
    rankingPosition: Optional<number>;
}

export function toSingleCompletedQuizResponse(singleGame: SinglePlayerGame, completedQuiz: Quiz): CompletedQuizResponse {
    const plainQuiz = completedQuiz.toPlainObject();

    return {
        kahootId: plainQuiz.id,
        gameId: singleGame.getGameId().getId(),
        gameType: 'Singleplayer',
        title: plainQuiz.title,
        completionDate: singleGame.getCompletedAt().getValue(),
        finalScore: singleGame.getScore().getScore(),
        rankingPosition: new Optional(),
    };
}