import { UserId } from "../../../kahoot/domain/valueObject/Quiz";
import { CompletedQuizQueryParams } from "../../infrastructure/DTOs/CompletedQuizQueryParams";

export class GetUserResults {
    constructor(public readonly userId: UserId, public readonly criteria: CompletedQuizQueryParams){}
}