import { Quiz } from "src/lib/kahoot/domain/entity/Quiz";
import { QuestionId } from "src/lib/kahoot/domain/valueObject/Question";
import { COMMON_ERRORS } from "../handlers/Errors/CommonErrors";

export const GetOptionsIdsAndCorrectAnswers = ( quiz: Quiz, questionId: QuestionId )  => { 

    const currentQuestion = quiz.getQuestionById( questionId );

    if( !currentQuestion ){
        throw new Error(COMMON_ERRORS.SLIDE_NOT_FOUND);
    }

    const answers = currentQuestion.getAnswers();
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
        throw new Error(COMMON_ERRORS.NO_OPTIONS);
    }

    const correctAnswerId: string[] = []
    const optionsId: string[] = []


    answers.forEach( ( option, index ) => { 
        if( option.isCorrect.getValue() ){
            correctAnswerId.push( index.toString() );
        }
        optionsId.push( index.toString() )
    });

    if( correctAnswerId.length === 0)
        throw new Error(COMMON_ERRORS.NO_VALID_OPTION);

    return {
        correctAnswerId,
        optionsId
    }


}