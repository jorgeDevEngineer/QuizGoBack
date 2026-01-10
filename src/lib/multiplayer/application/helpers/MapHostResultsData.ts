import { MultiplayerSession } from "../../domain/aggregates/MultiplayerSession";
import { QuestionId } from "src/lib/kahoot/domain/valueObject/Question";
import { PlayerLeaderboardEntry } from "../responseDtos/types/PlayerLeaderboardEntry.interface";
import { QuestionResultsHostResponseDto } from "../responseDtos/QuestionResultResponses.dto";

export const MapHostResultsData = (
    session: MultiplayerSession, 
    questionId: QuestionId, 
    options: { correctAnswerId: string [], optionsId: string []}
): QuestionResultsHostResponseDto => {

    // Ahora mapeamos todo lo referente al scoreboard y las stats para el host
    const state = session.getSessionStateType();

    const progress = {
        current: session.getCurrentQuestionIndex(), // No restamos 1 porque realmente nos interesa tener el valor del indice actual
        total: session.getTotalOfQuestions(),
    }

    const stats = {
        totalAnswers: session.getNumberOfAnswersForAQuestion( questionId ),
        distribution: session.calculateAnswerDistributionForAQuestion( questionId, options.optionsId )
    }

    // Solo nos interesa en este caso el top 5 del scoreboard para el host
    const entries = session.getTopFive();
    const leaderboard: PlayerLeaderboardEntry[] = [];

    entries.forEach( entry => {
        const playerId = entry.getPlayerId()

        leaderboard.push({
            playerId: playerId.getId(),
            nickname: entry.getNickname().getNickname(),
            score: entry.getScore().getScore(),            
            rank: entry.getRank(),          
            previousRank: entry.getPreviousRank(),  
        });

    });


    return {
        state: state,
        correctAnswerId: options.correctAnswerId,
        leaderboard: leaderboard,
        stats: stats,
        progress: {
            ...progress,
            isLastSlide: !session.hasMoreQuestionsToAnswer(), 
        },
    }
    
};