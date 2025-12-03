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
        if (playerAnswer.getAnswer().hasValue()){
            const answerIndex = playerAnswer.getAnswer().getValue();
            if(question.type.getValue() === 'multiple') {
                //Hay que implementar esto
                return true;
            } else {
                return question.getAnswers()[(answerIndex as number)-1].isCorrect.getValue();
            }
        } else {
            return false;
        }
    }

    private calculatePoints(question:Question, isCorrect:boolean, timeUsed:number): number {
        if (!isCorrect){
            return 0;
        } 
        const timeLimit: number = question.timeLimit.getValue();
        const basePoints: number = question.getPoints().getValue();

        const timeLeftRatio: number = (timeLimit - (timeUsed/1000)) / timeLimit;
        const speedMultiplier: number = 1 + Math.pow(timeLeftRatio, 1.5) * 0.8;

        return Math.round((basePoints * speedMultiplier)/10) * 10;
    }

}