import { MultiplayerSession } from "../../domain/aggregates/MultiplayerSession";
import { QuestionId } from "src/lib/kahoot/domain/valueObject/Question";
import { LeaderboardEntry } from "../../domain/valueObjects/multiplayerVOs";
import { QuestionResultsPlayerResponseDto } from "../responseDtos/QuestionResultResponses.dto";
import { FeedbackGenerator } from "./FeedbackGenerator";

export const MapPlayerResultsData = (

    session: MultiplayerSession, 
    questionId: QuestionId, 
    entry: LeaderboardEntry,
    options: { correctAnswerId: string [], optionsId: string []}

): QuestionResultsPlayerResponseDto => {

    const state = session.getSessionStateType();

    const playerId = entry.getPlayerId();

    const playerAnswer = session.getOnePlayerAnswerForAQuestion( questionId, playerId );

    const progress = {
        current: session.getCurrentQuestionIndex(), // No restamos 1 porque realmente nos interesa tener el valor del indice actual
        total: session.getTotalOfQuestions(),
    }

    if( playerAnswer ){

        const streak = session.getPlayerById( playerId ).getStreak()
        
        const motivationalMessage = FeedbackGenerator.generate({
            isCorrect: playerAnswer.getIsCorrect(),
            currentStreak: streak,
            rank: entry.getRank(),
            score: entry.getScore().getScore()
        });

        return {
            state: state,
            isCorrect: playerAnswer.getIsCorrect(),
            pointsEarned: playerAnswer.getEarnedScore(),
            totalScore: entry.getScore().getScore(),
            rank: entry.getRank(),
            previousRank: entry.getPreviousRank(),
            streak: streak,
            correctAnswerIds: options.correctAnswerId,
            message: motivationalMessage, 
            progress: progress, 
        }
                    
    }

    // Respuesta default para usuarios que no respondieron
    return {
        state: state,
        isCorrect: false,
        pointsEarned: 0,
        totalScore: 0, // O buscar su score en otro lado si fuera crítico
        rank: 0,
        previousRank: 0,
        streak: 0,
        correctAnswerIds: options.correctAnswerId,
        message: FeedbackGenerator.noAnswerMessages[Math.floor( Math.random() * FeedbackGenerator.noAnswerMessages.length )],
        progress: progress, 
    }

}