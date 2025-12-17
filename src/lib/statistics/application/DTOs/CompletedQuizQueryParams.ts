import { QuizQueryParamsInput} from '../../../library/application/DTOs/QuizQueryParamsDTO';
import { CompletedQuizQueryCriteria } from "../Response Types/CompletedQuizQueryCriteria";

export type CompletedQuizQueryParams = Pick<QuizQueryParamsInput, 'page' | 'limit' | 'order' | 'orderBy'>;

export class CompletedQuizQueryParamsDTO {
  page?: number;
  limit?: number;
  order?: 'asc' | 'desc' | 'ASC' | 'DESC';
  orderBy?: string;

  constructor(input: CompletedQuizQueryParams = {}) {
     // Page: default 1
     const rawPage = Number(input.page);
     this.page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
 
     // Limit: default 20, max 50
     const rawLimit = Number(input.limit);
     this.limit =
       Number.isFinite(rawLimit) && rawLimit > 0
         ? Math.min(rawLimit, 50)
         : 20;

    // Order: default "asc"
    const normalizedOrder = (input.order || 'asc').toString().toUpperCase();
    this.order =
      normalizedOrder === 'ASC' || normalizedOrder === 'DESC'
        ? normalizedOrder
        : 'ASC';
    
    // OrderBy: default "completionDate"
    this.orderBy = input.orderBy || 'completionDate';    
  }

  toCriteria(params: CompletedQuizQueryParamsDTO){
    return new CompletedQuizQueryCriteria(
         this.page!,
         this.limit!,
         this.order! as 'ASC' | 'DESC',
         this.orderBy,
     );
 }

}