import { SinglePlayerGame } from "../../../singlePlayerGame/domain/aggregates/SinglePlayerGame";
import { Quiz } from "../../../kahoot/domain/entity/Quiz";
import { MultiplayerSession } from "src/lib/multiplayer/domain/aggregates/MultiplayerSession";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { PlayerId } from "src/lib/multiplayer/domain/valueObjects/playerVOs";

export type CompletedQuizResponse = {
  kahootId: string;
  gameId: string;
  gameType: "Singleplayer" | "Multiplayer";
  title: string;
  completionDate: Date;
  finalScore: number;
  rankingPosition: number | null;
};

export function toSingleCompletedQuizResponse(
  singleGame: SinglePlayerGame,
  completedQuiz: Quiz
): CompletedQuizResponse {
  const plainQuiz = completedQuiz.toPlainObject();

  return {
    kahootId: plainQuiz.id,
    gameId: singleGame.getGameId().getId(),
    gameType: "Singleplayer",
    title: plainQuiz.title,
    completionDate: singleGame.getCompletedAt().getValue(),
    finalScore: singleGame.getScore().getScore(),
    rankingPosition: null,
  };
}

export function toMultiPlayerCompletedQuizResponse(
  multiGame: MultiplayerSession,
  playerId: UserId,
  completedQuiz: Quiz
): CompletedQuizResponse {
  const plainQuiz = completedQuiz.toPlainObject();
  const score = multiGame
    .getPlayersScores()
    .find((score) => score[0].getId() === playerId.getValue());

  return {
    kahootId: plainQuiz.id,
    gameId: multiGame.getId().getId(),
    gameType: "Multiplayer",
    title: plainQuiz.title,
    completionDate: multiGame.getCompletionDate(),
    finalScore: score[1],
    rankingPosition: multiGame
      .getLeaderboardEntryFor(PlayerId.of(playerId.value))
      .getRank(),
  };
}
