import { Body, Controller, Get, HttpCode, Inject, Param, Query } from '@nestjs/common';
import { Either } from 'src/lib/shared/Type Helpers/Either';
import { DomainException } from '../../../shared/exceptions/DomainException';
import { IHandler } from 'src/lib/shared/IHandler';
import { GetUserResults } from '../../application/Parameter Objects/GetUserResults';
import { CompletedQuizResponse } from '../../application/Response Types/CompletedQuizResponse';
import { UserIdDTO } from '../../application/DTOs/UserIdDTO';
import { CompletedQuizQueryParams } from '../../application/DTOs/CompletedQuizQueryParams';
import { AttemptIdDTO } from '../../application/DTOs/AttemptIdDTO';
import { GetCompletedQuizSummary } from '../../application/Parameter Objects/GetCompletedQuizSummary';
import { UserId } from 'src/lib/kahoot/domain/valueObject/Quiz';
import { SinglePlayerGameId } from 'src/lib/singlePlayerGame/domain/valueObjects/SinglePlayerGameVOs';
import { QuizPersonalResult } from '../../application/Response Types/QuizPersonalResult';

@Controller('reports')
export class StatisticsController {
   constructor(
    @Inject('GetUserResultsQueryHandler')
    private readonly getUserResults: IHandler<GetUserResults, Either<DomainException, CompletedQuizResponse[]>>,
   @Inject('GetCompletedQuizSummaryQueryHandler')
   private readonly getCompletedQuizSummary: IHandler<GetCompletedQuizSummary, Either<DomainException, QuizPersonalResult>>,
   ){}

   @Get('kahoots/my-results')
   async getUserQuizResults(@Body() userId: UserIdDTO, @Query() queryParams: CompletedQuizQueryParams): Promise<CompletedQuizResponse[]>{
      const playerId = UserId.of(userId.userId);
      const command = new GetUserResults(playerId, queryParams);
      const results = await this.getUserResults.execute(command);
      if(results.isLeft()){
        throw results.getLeft();
      }
      return results.getRight();
   }

   @Get('/singleplayer/:attemptId')
   async getSinglePlayerAttemptResults(@Param('attemptId') attemptId: string): Promise<QuizPersonalResult>{
      const gameId = new AttemptIdDTO(attemptId.trim());
      const command = new GetCompletedQuizSummary(SinglePlayerGameId.of(gameId.attemptId));
      const results = await this.getCompletedQuizSummary.execute(command);
      if(results.isLeft()){
        throw results.getLeft();
      }
      return results.getRight();
   }
}