import { Optional } from "../../../shared/Type Helpers/Optional";
import { SinglePlayerGame } from "../../../singlePlayerGame/domain/aggregates/SinglePlayerGame";
import { Quiz } from "../../../kahoot/domain/entity/Quiz";
import { QuestionResult } from "src/lib/singlePlayerGame/domain/valueObjects/SinglePlayerGameVOs";

type questionData = {
    questionIndex: number,
    questionText: string,
    isCorrect: boolean,
    answerText: string[],
    answerMediaId: string[],
    timeTakenMs: number
}

export type QuizPersonalResult = {
    kahootId: string,
    title: string,
    userId: string,
    finalScore: number,
    correctAnswers: number,
    totalQuestions: number,
    averageTimeMs: number,
    questionResults: questionData[]
}

function getAnswerTextOrMedia(questionResult: QuestionResult, kahoot: Quiz): Optional<{results: string[], isText: boolean}> {
    const questionId = questionResult.getQuestionId();
    const question = kahoot.getQuestionById(questionId);
    if (!question) {
        throw new Error(`Question with ID ${questionId.getValue()} not found in Kahoot ${kahoot.id.getValue()}`);
    }
    const answersIndex = questionResult.getPlayerAnswer().getAnswer();
    const results: string[] = [];
    let isText: boolean = false;
    if(Array.isArray(answersIndex) && answersIndex.length == 0){
        return new Optional();
    }
    if(Array.isArray(answersIndex)){
        answersIndex.forEach((answerIndex) => {
            const answer = question.getAnswers()[answerIndex-1];
            if(answer.getText()){
                isText = true;
                results.push(answer.getText()!.getValue());
            }
            results.push(answer.getMediaId().value);
        });
      return new Optional({results: results, isText: isText});    
    }
    else{
        const answer = question.getAnswers()[answersIndex-1];
        if(answer.getText()){
            isText = true;
            results.push(answer.getText()!.getValue());
        }else{
            results.push(answer.getMediaId().value);
        }  
        return new Optional({results: results, isText: isText});
    }
}

function calculateAverageTime(questionResults: questionData[]): number {
    const totalTime = questionResults.reduce((acc, curr) => acc + curr.timeTakenMs, 0);
    return Math.round(totalTime / questionResults.length);
}

export function toQuizPersonalResult(kahoot: Quiz, game: SinglePlayerGame): QuizPersonalResult {
    const answeredQuestions = game.getQuestionsResults();
    const questionResults: questionData[] = answeredQuestions.map((questionResult, index) => {
        const answerDataOpt = getAnswerTextOrMedia(questionResult, kahoot);
        let answerText: string[] = [];
        let answerMediaId: string[] = [];
        if(answerDataOpt.hasValue()){
            const answerData = answerDataOpt.getValue();
            if(answerData.isText){
                answerText = answerData.results;
            } else {
                answerMediaId = answerData.results;
            }
        }
        return {
            questionIndex: index + 1,
            questionText: kahoot.getQuestionById(questionResult.getQuestionId())?.text.getValue() || '',
            isCorrect: questionResult.getEvaluatedAnswer().getWasCorrect(),
            answerText: answerText,
            answerMediaId: answerMediaId,
            timeTakenMs: questionResult.getPlayerAnswer().getTimeUsed()
        };
    });
    return {
        kahootId: kahoot.id.getValue(),
        title: kahoot.toPlainObject().title,
        userId: game.getPlayerId().getValue(),
        finalScore: game.getScore().getScore(),
        correctAnswers: game.getCorrectAnswersCount(),
        totalQuestions: kahoot.getQuestions().length,
        averageTimeMs: calculateAverageTime(questionResults),
        questionResults: questionResults
    }
}