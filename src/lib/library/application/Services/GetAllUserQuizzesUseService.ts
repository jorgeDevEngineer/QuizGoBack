import { Quiz } from 'src/lib/kahoot/domain/entity/Quiz';
import { UserId } from 'src/lib/user/domain/valueObject/UserId';
import { QuizQueryParamsDto, QuizQueryParamsInput } from '../DTOs/QuizQueryParamsDTO';
import { UserIdDTO } from "../DTOs/UserIdDTO";
import { QuizResponse, toQuizResponse } from '../Response Types/QuizResponse';
import { Either } from 'src/lib/shared/Either';
import { QueryResponse} from '../Response Types/QueryResponse';
import { DomainUnexpectedException } from "../../domain/exceptions/DomainUnexpectedException";
import { DomainException } from '../../domain/exceptions/DomainException';
import { GetUserQuizzesDomainService } from '../../domain/services/GetUserQuizzesDomainService';

export class GetAllUserQuizzesService {
constructor(private readonly getQuizDService: GetUserQuizzesDomainService
) {}

  async run(id: UserIdDTO, queryInput: QuizQueryParamsInput): Promise<Either<DomainException, QueryResponse<QuizResponse>>> {
    try{
      const query = new QuizQueryParamsDto(queryInput);
      const criteria = query.toCriteria();
      // 1. Convertir string a Value Object
      const userId = new UserId(id.userId);
      const dServiceResponse = await this.getQuizDService.getQuizzesForUser(userId, criteria);
      if (dServiceResponse.isLeft()) {
        return Either.makeLeft(dServiceResponse.getLeft());
      }
      
      const { quizzes, user, totalCount } = dServiceResponse.getRight();
      const data:QuizResponse[] = quizzes.map((quiz:Quiz) => toQuizResponse(quiz, user));
  
      const answer:QueryResponse<QuizResponse>= {
        data,
        pagination:{
          page: criteria.page,
          limit: criteria.limit,
          totalCount,
          totalPages: Math.ceil(totalCount / criteria.limit),
         }
        };
  
      return Either.makeRight<DomainException, QueryResponse<QuizResponse>>(answer);
    } catch(error){
      return Either.makeLeft(new DomainUnexpectedException());
    }
  } 
}