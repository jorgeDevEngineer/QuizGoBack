import { Quiz } from 'src/lib/kahoot/domain/entity/Quiz';
import { UserId } from 'src/lib/user/domain/valueObject/UserId';
import { QuizQueryParamsDto } from '../../DTOs/QuizQueryParamsDTO';
import { QuizResponse, toQuizResponse } from '../../Response Types/QuizResponse';
import { Either } from 'src/lib/shared/Either';
import { QueryWithPaginationResponse} from '../../Response Types/QueryWithPaginationResponse';
import { DomainUnexpectedException } from "../../../domain/exceptions/DomainUnexpectedException";
import { DomainException } from '../../../domain/exceptions/DomainException';
import { GetUserQuizzesDomainService } from '../../../domain/services/GetUserQuizzesDomainService';
import { GetUserQuizzes as GetAllUserQuizzes} from '../../Parameter Objects/GetUserQuizzes';
import { IHandler } from 'src/lib/shared/IHandler';

/**
 * Obtiene todos los kahoots de un usuario(publicados y drafts).
 */
export class GetAllUserQuizzesQueryHandler implements IHandler<GetAllUserQuizzes, Either<DomainException, QueryWithPaginationResponse<QuizResponse>>> {
constructor(private readonly getQuizDService: GetUserQuizzesDomainService
) {}

  async execute(command: GetAllUserQuizzes): Promise<Either<DomainException, QueryWithPaginationResponse<QuizResponse>>> {
    try{
      const query = new QuizQueryParamsDto(command.queryInput);
      const criteria = query.toCriteria();
      // 1. Convertir string a Value Object
      const userId = new UserId(command.userId);
      const dServiceResponse = await this.getQuizDService.execute(userId, criteria);
      if (dServiceResponse.isLeft()) {
        return Either.makeLeft(dServiceResponse.getLeft());
      }
      
      const { quizzes, user, totalCount } = dServiceResponse.getRight();
      const data:QuizResponse[] = quizzes.map((quiz:Quiz) => toQuizResponse(quiz, user));
  
      const answer:QueryWithPaginationResponse<QuizResponse>= {
        data,
        pagination:{
          page: criteria.page,
          limit: criteria.limit,
          totalCount,
          totalPages: Math.ceil(totalCount / criteria.limit),
         }
        };
  
      return Either.makeRight<DomainException, QueryWithPaginationResponse<QuizResponse>>(answer);
    } catch(error){
      return Either.makeLeft(new DomainUnexpectedException());
    }
  } 
}