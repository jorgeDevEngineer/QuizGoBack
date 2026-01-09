import { QuizId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { EvaluatedAnswer, PlayerAnswer, QuestionResult } from "../valueObjects/SinglePlayerGameVOs";
import { QuizRepository } from "src/lib/kahoot/domain/port/QuizRepository";
import { Quiz } from "src/lib/kahoot/domain/entity/Quiz";
import { Question } from "src/lib/kahoot/domain/entity/Question";

export class SinglePlayerEvaluationService {
    
    async evaluate(quizId: QuizId, playerAnswer:PlayerAnswer, quizRepo: QuizRepository):Promise<QuestionResult>{

        const quiz:Quiz = await quizRepo.find(quizId);
        if(!quiz){
            throw new Error('No se encontró el quiz');
        }

        const question:Question = quiz.getQuestions().find( question => question.id.equals(playerAnswer.getQuestionId()));
        if(!question){
            throw new Error('No se encontró la pregunta en el quiz asignado');
        }

        const isCorrect: boolean = this.isAnswerCorrect(question, playerAnswer);
        const pointsEarned: number = this.calculatePoints(question, isCorrect, playerAnswer.getTimeUsed());

        const evaluatedAnswer: EvaluatedAnswer = EvaluatedAnswer.create(isCorrect, pointsEarned);

        return QuestionResult.create(question.id, playerAnswer, evaluatedAnswer);

    }

    private isAnswerCorrect(question:Question, playerAnswer:PlayerAnswer): boolean {
        const answerIndex = playerAnswer.getAnswer();
        if (answerIndex.length === 0){
            //No respondió nada
            return false;
        } 
        let isCorrect = true;
        if (question.type.getValue() === 'multiple') {
            //Más de una respuesta correcta, tipo multiple, solo es correcta si me marcaron TODAS las correctas y NINGUNA incorrecta
            isCorrect = this.multipleAnswerEvaluation(question, playerAnswer);
        } else {
            //Una sola respuesta correcta, tipo quiz y verdadero o falso
            isCorrect = question.getAnswers()[answerIndex[0]-1].isCorrect.getValue();
        }
        return isCorrect;
    }

    private multipleAnswerEvaluation(question: Question, playerAnswer: PlayerAnswer): boolean {
        const selectedIndexes = playerAnswer.getAnswer();
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