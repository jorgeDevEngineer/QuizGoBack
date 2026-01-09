import { Quiz } from "src/lib/kahoot/domain/entity/Quiz";
import { MultiplayerSession } from "../aggregates/MultiplayerSession";
import { QuestionId } from "src/lib/kahoot/domain/valueObject/Question";
import { PlayerId } from "../valueObjects/playerVOs";
import { Question } from "src/lib/kahoot/domain/entity/Question";
import { MultiplayerAnswer } from "../valueObjects/multiplayerVOs";
import { GameScore } from "src/lib/shared/domain/valueObjects";

export class MultiplayerEvaluationService {
    
    public evaluatePlayerSubmission(
       quiz: Quiz,
       session: MultiplayerSession, 
       questionId: QuestionId,
       playerId: PlayerId,
       timeUsedMs: number,
       answerIndex: number[]
    ): void {

        if (session.hasPlayerAnsweredQuestion(questionId, playerId)){
            throw new Error("El jugador ya ha enviado una respuesta para esta pregunta.");
        }

        const question:Question = quiz.getQuestionById(questionId);
        const isCorrect = this.isAnswerCorrect(question, answerIndex);
        const points = GameScore.create(this.calculatePoints(question, isCorrect, timeUsedMs));

        const playerEvaluation = MultiplayerAnswer.create(playerId, questionId, answerIndex, isCorrect, points, timeUsedMs);

        session.addPlayerAnswer( questionId, playerEvaluation );
    }

    private isAnswerCorrect(question:Question, answerIndex:number[]): boolean {
        if (answerIndex.length === 0){
            //No respondió nada
            return false;
        } 
        let isCorrect = true;
        if (question.type.getValue() === 'multiple') {
            //Más de una respuesta correcta, tipo multiple, solo es correcta si me marcaron TODAS las correctas y NINGUNA incorrecta
            isCorrect = this.multipleAnswerEvaluation(question, answerIndex);
        } else {
            //Una sola respuesta correcta, tipo quiz y verdadero o falso
            isCorrect = question.getAnswers()[answerIndex[0]-1].isCorrect.getValue();
        }
        return isCorrect;
    }
    
    private multipleAnswerEvaluation(question: Question, selectedIndexes: number[]): boolean {
        const answers = question.getAnswers();
            
        for (const selectedIndex of selectedIndexes) {
            const answer = answers[selectedIndex - 1];
            if (!answer.isCorrect.getValue()) {
                return false;
            }
        }
            
        const allCorrectIndexes: number[] = [];
            
        for (let i = 0; i < answers.length; i++) {
            if (answers[i].isCorrect.getValue()) {
                allCorrectIndexes.push(i + 1); 
            }
        }
            
        if (selectedIndexes.length !== allCorrectIndexes.length) {
            return false;
        }
            
        const sortedSelected = [...selectedIndexes].sort((a, b) => a - b);
        const sortedCorrect = [...allCorrectIndexes].sort((a, b) => a - b);
            
        for (let i = 0; i < sortedSelected.length; i++) {
            if (sortedSelected[i] !== sortedCorrect[i]) {
                return false;
            }
        }
            
        return true; 
    }
    
    private calculatePoints(question:Question, isCorrect:boolean, timeUsed:number): number {
        if (!isCorrect){
            return 0;
        } 
        const timeLimit: number = question.timeLimit.getValue();
        const basePoints: number = question.points.getValue();
    
        const timeLeftRatio: number = (timeLimit - (timeUsed/1000)) / timeLimit;
        const speedMultiplier: number = 1 + Math.pow(timeLeftRatio, 1.5) * 0.8;
    
        return Math.round((basePoints * speedMultiplier)/10) * 10;
    }

}