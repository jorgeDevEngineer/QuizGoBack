import { QuestionTypeValue } from "src/lib/kahoot/domain/valueObject/Question";

export interface OptionWithoutAnswers {
    index: string;
    text?: string;
    mediaURL?: string; 
}

export interface QuestionWithoutAnswers {
    id: string;
    position: number;
    slideType: QuestionTypeValue; 
    timeLimitSeconds: number; 
    //Opcionales
    questionText?: string; 
    slideImageURL?: string; 
    pointsValue?: number; 
    descriptionText?: string; 
    options?: OptionWithoutAnswers[]; 
}