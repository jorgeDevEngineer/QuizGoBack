import { CompletedQuizQueryCriteria } from "../Response Types/CompletedQuizQueryCriteria";

export class GetUserResults {
    constructor(public readonly userId: string, public readonly criteria: CompletedQuizQueryCriteria){}
}