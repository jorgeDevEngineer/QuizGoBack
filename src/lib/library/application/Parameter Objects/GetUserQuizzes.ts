import { QuizQueryParamsInput } from "../../infrastructure/DTOs/QuizQueryParamsDTO";

export class GetUserQuizzes{
    constructor(
        public readonly userId: string,
        public readonly queryInput: QuizQueryParamsInput
    ){}
}