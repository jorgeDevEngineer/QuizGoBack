import { MultiplayerQuestionResult } from "src/lib/multiplayer/domain/valueObjects/multiplayerVOs";
import { MultiplayerSession } from "../../../multiplayer/domain/aggregates/MultiplayerSession";
import { PlayerId } from "../../../multiplayer/domain/valueObjects/playerVOs";
import { Quiz } from "src/lib/kahoot/domain/entity/Quiz";
import { randomUUID } from "crypto";

type playerPosition = {
  position: number;
  username: string;
  score: number;
  correctAnswers: number;
};

type questionAnalysis = {
  questionIndex: number;
  questionText: string;
  correctPercentage: number;
};

export type SessionReportResponse = {
  reportId: string;
  sessionId: string;
  title: string;
  executionDate: Date;
  playerRanking: playerPosition[];
  questionsAnalysis: questionAnalysis[];
};

function countCorrectAnswers(
  playerId: PlayerId,
  answers: MultiplayerQuestionResult[]
): number {
  let correctAnswers = 0;
  for (const answer of answers) {
    let playerAnswer = answer.searchPlayerAnswer(playerId);
    if (playerAnswer && playerAnswer.getIsCorrect()) {
      correctAnswers++;
    }
  }
  return correctAnswers;
}

function createPlayerRanking(game: MultiplayerSession): playerPosition[] {
  let ranking: playerPosition[] = [];
  let players = game.getPlayers();
  let questionResults = game.getMultiplayerQuestionsResults();
  for (const player of players) {
    let correctAnswers = countCorrectAnswers(player.getId(), questionResults);
    ranking.push({
      position: game.getLeaderboardEntryFor(player.getId()).getRank(),
      username: player.getNickname().getNickname(),
      score: player.getScore().getScore(),
      correctAnswers: correctAnswers,
    });
  }
  return ranking;
}

function makeQuestionsAnalysis(
  game: MultiplayerSession,
  kahoot: Quiz
): questionAnalysis[] {
  const questions = kahoot.getQuestions();
  let index = 0;
  let analysis: questionAnalysis[] = [];
  for (const question of questions) {
    const questionResults = game.getPlayersAnswersForAQuestion(question.id);
    const totalAnswers = questionResults.length;
    const correctAnswers = questionResults.filter((answer) =>
      answer.getIsCorrect()
    ).length;
    const correctPercentage =
      totalAnswers === 0 ? 0 : correctAnswers / totalAnswers;
    analysis.push({
      questionIndex: index,
      questionText: question.text.value,
      correctPercentage: correctPercentage,
    });
    index++;
  }
  return analysis;
}

export function toSessionReportResponse(
  game: MultiplayerSession,
  kahoot: Quiz
): SessionReportResponse {
  return {
    reportId: randomUUID(),
    sessionId: game.getId().getId(),
    title: kahoot.getTitle(),
    executionDate: game.getCompletionDate()!,
    playerRanking: createPlayerRanking(game),
    questionsAnalysis: makeQuestionsAnalysis(game, kahoot),
  };
}
