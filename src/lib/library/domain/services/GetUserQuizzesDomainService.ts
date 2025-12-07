import { QuizRepository } from '../../domain/port/QuizRepository';
import { Quiz } from 'src/lib/kahoot/domain/entity/Quiz';
import { UserId } from 'src/lib/user/domain/valueObject/UserId';
import { UserRepository } from 'src/lib/user/domain/port/UserRepository';
import { Either } from 'src/lib/shared/Either';
import { User } from 'src/lib/user/domain/aggregate/User';
import { DomainException } from '../exceptions/DomainException';
import { QuizzesNotFoundException } from '../exceptions/QuizzesNotFoundException';
import { UserNotFoundException } from '../exceptions/UserNotFoundException';
import { QuizQueryCriteria } from '../valueObject/QuizQueryCriteria';

export class GetUserQuizzesDomainService {
    constructor(private readonly quizRepo: QuizRepository, private readonly userRepo: UserRepository) {}
  
    async getQuizzesForUser(userId: UserId, criteria: QuizQueryCriteria)
      : Promise<Either<DomainException, { quizzes: Quiz[], user: User, totalCount: number }>> {
  
      const user = await this.userRepo.getOneById(userId);
      if (!user) return Either.makeLeft(new UserNotFoundException());
  
      const [quizzes, totalCount] = await this.quizRepo.searchByAuthor(userId, criteria);
      if (quizzes.length === 0) return Either.makeLeft(new QuizzesNotFoundException());
  
      return Either.makeRight({ quizzes, user, totalCount });
    }
  }