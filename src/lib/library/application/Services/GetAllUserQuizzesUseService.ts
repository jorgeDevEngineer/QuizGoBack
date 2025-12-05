import { QuizRepository } from '../../domain/port/QuizRepository';
import { Quiz } from 'src/lib/kahoot/domain/entity/Quiz';
import { UserId } from 'src/lib/user/domain/valueObject/UserId';
import { QuizQueryParamsDto, QuizQueryParamsInput } from '../DTOs/QuizQueryParamsDTO';
import { UserIdDTO } from "../DTOs/UserIdDTO";
import { QuizResponse, toQuizResponse } from '../Response Types/QuizResponse';
import { Either } from 'src/lib/shared/Either';
import { HttpException } from '@nestjs/common';
import { QueryResponse} from '../Response Types/QueryResponse';
import { QuizzesNotFoundException } from "../../domain/exceptions/QuizzesNotFoundException";
import { UserRepository } from 'src/lib/user/domain/port/UserRepository';
import { UserNotFoundException } from '../../domain/exceptions/UserNotFoundException';
import { DomainUnexpectedException } from "../../domain/exceptions/DomainUnexpectedException";

export class GetAllUserQuizzesService {
constructor(private readonly quizRepository: QuizRepository,
  private readonly userRepo: UserRepository
) {}

  async run(id: UserIdDTO, queryInput: QuizQueryParamsInput): Promise<Either<HttpException, QueryResponse<QuizResponse>>> {
    try{
      const query = new QuizQueryParamsDto(queryInput);
      const criteria = query.toCriteria();
      // 1. Convertir string a Value Object
      const userId = new UserId(id.userId);
      
       // 2. Llamar al método de búsqueda del repositorio
      const [quizzes, totalCount] = await this.quizRepository.searchByAuthor(userId, criteria);
      const user = await this.userRepo.getOneById(userId);
      if(quizzes.length === 0 ){
        return Either.makeLeft(new QuizzesNotFoundException());
      }
      if(!user){
        return Either.makeLeft(new UserNotFoundException());
      }
  
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
  
      return Either.makeRight<HttpException, QueryResponse<QuizResponse>>(answer);
    } catch(error){
      return Either.makeLeft(new DomainUnexpectedException());
    }
  } 
}