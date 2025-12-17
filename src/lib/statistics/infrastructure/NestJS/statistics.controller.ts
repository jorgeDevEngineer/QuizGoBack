import { Body, Controller, Get, HttpCode, Inject, Param, Query } from '@nestjs/common';
import { Either } from 'src/lib/shared/Type Helpers/Either';
import { DomainException } from '../../../shared/exceptions/DomainException';
import { IHandler } from 'src/lib/shared/IHandler';
import { GetUserResults } from '../../application/Parameter Objects/GetUserResults';
import { CompletedQuizResponse } from '../../application/Response Types/CompletedQuizResponse';
import { UserIdDTO } from '../../application/DTOs/UserIdDTO';
import { CompletedQuizQueryParams } from '../../application/DTOs/CompletedQuizQueryParams';

@Controller('reports')
export class StatisticsController {
   constructor(
    @Inject('GetUserResultsQueryHandler')
    private readonly getUserResults: IHandler<GetUserResults, Either<DomainException, CompletedQuizResponse[]>>
   ){}

   @Get('kahoots/my-results')
   async getUserQuizResults(@Body() userId: UserIdDTO, @Query() queryParams: CompletedQuizQueryParams): Promise<CompletedQuizResponse[]>{
      const command = new GetUserResults(userId.userId, queryParams);
      const results = await this.getUserResults.execute(command);
      if(results.isLeft()){
        throw results.getLeft();
      }
      return results.getRight();
   }
}