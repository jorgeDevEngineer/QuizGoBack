import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post, Query } from '@nestjs/common';
import { UserIdDTO } from '../../application/DTOs/UserIdDTO';
import { AddUserFavoriteQuizCommandHanlder } from '../../application/Handlers/Commands/AddUserFavoriteQuizCommandHandler';
import { DeleteUserFavoriteQuizCommandHandler } from '../../application/Handlers/Commands/DeleteUserFavoriteQuizCommandHandler';
import { GetAllUserQuizzesQueryHandler } from '../../application/Handlers/Querys/GetAllUserQuizzesQueryHandler';
import { GetUserFavoriteQuizzesQueryHandler } from '../../application/Handlers/Querys/GetUserFavoriteQuizzesQueryHandler';
import { QuizResponse } from '../../application/Response Types/QuizResponse';
import { QuizQueryParamsInput } from '../../application/DTOs/QuizQueryParamsDTO';
import { QueryWithPaginationResponse } from '../../application/Response Types/QueryWithPaginationResponse';
import { PlayingQuizResponse } from '../../application/Response Types/PlayingQuizResponse';
import { GetUserInProgressQuizzesQueryHandler } from '../../application/Handlers/Querys/GetUserInProgessQuizzesQueryHandler';
import { GetUserCompletedQuizzesQueryHandler } from '../../application/Handlers/Querys/GetUserCompletedQuizzesQueryHandler';
import { DeleteUserFavoriteQuiz } from '../../application/Parameter Objects/DeleteUserFavoriteQuiz';
import { AddUserFavoriteQuiz } from '../../application/Parameter Objects/AddUserFavoriteQuiz';
import { GetUserQuizzes } from '../../application/Parameter Objects/GetUserQuizzes';

@Controller('library')
export class LibraryController {
   constructor(
       @Inject('AddUserFavoriteQuizService')
       private readonly addUserFavoriteQuizService: AddUserFavoriteQuizCommandHanlder,
       @Inject('DeleteUserFavoriteQuizService')
       private readonly deleteUserFavoriteQuizService: DeleteUserFavoriteQuizCommandHandler,
       @Inject('GetUserFavoriteQuizzesService')
       private readonly getUserFavoriteQuizzesService: GetUserFavoriteQuizzesQueryHandler,
       @Inject('GetAllUserQuizzesService')
       private readonly getAllUserQuizzesService: GetAllUserQuizzesQueryHandler,
       @Inject('GetInProgressQuizzesService')
       private readonly getInProgressQuizzesService: GetUserInProgressQuizzesQueryHandler,
       @Inject('GetCompletedQuizzesService')
       private readonly getCompletedQuizzesService: GetUserCompletedQuizzesQueryHandler,
    ){}

    @Post('favorites/:quizId')
    @HttpCode(201)
    async addFavorite(@Param('quizId') quizId: string, @Body() dto: UserIdDTO): Promise<void> {
        const command = new AddUserFavoriteQuiz(dto.userId, quizId);
        const result = await this.addUserFavoriteQuizService.execute(command);
        if(result.isLeft()){
            throw result.getLeft();
         }
        return result.getRight();
    }

    @Delete('favorites/:quizId')
    @HttpCode(204)
    async deleteFavorite(@Param('quizId') quizId: string, @Body() dto: UserIdDTO): Promise<void> {
        const command = new DeleteUserFavoriteQuiz(dto.userId, quizId);
        const result = await this.deleteUserFavoriteQuizService.execute(command);
        if(result.isLeft()){
            throw result.getLeft();
         }
        return result.getRight();
    }

    @Get('favorites')
    @HttpCode(200)
    async getFavorites(@Body() dto: UserIdDTO, @Query() queryParams: QuizQueryParamsInput): Promise<
    QueryWithPaginationResponse<QuizResponse>> {
        const command = new GetUserQuizzes(dto.userId, queryParams);
        const result = await this.getUserFavoriteQuizzesService.execute(command);
        if(result.isLeft()){
            throw result.getLeft();
         }
        return result.getRight();
    }

    @Get('my-creations')
    @HttpCode(200)
    async getMyCreations(@Body() dto: UserIdDTO, @Query() queryParams: QuizQueryParamsInput): Promise<
    QueryWithPaginationResponse<QuizResponse>> {
        const command = new GetUserQuizzes(dto.userId, queryParams);
        const result = await this.getAllUserQuizzesService.execute(command);
        if(result.isLeft()){
            throw result.getLeft();
         }
        return result.getRight();
    }
    
    @Get('in-progress')
    @HttpCode(200)
    async getInProgressQuizzes(@Body() dto: UserIdDTO, @Query() queryParams: QuizQueryParamsInput): Promise<
    QueryWithPaginationResponse<PlayingQuizResponse>> {
        const command = new GetUserQuizzes(dto.userId, queryParams);
        const result = await this.getInProgressQuizzesService.execute(command);
        if(result.isLeft()){
         throw result.getLeft();
         }
        return result.getRight();
    }

    @Get('completed')
    @HttpCode(200)
    async getCompletedQuizzes(@Body() dto: UserIdDTO, @Query() queryParams: QuizQueryParamsInput): Promise<QueryWithPaginationResponse<PlayingQuizResponse>> {
        const command = new GetUserQuizzes(dto.userId, queryParams);
        const result = await this.getCompletedQuizzesService.execute(command);
        if(result.isLeft()){
         throw result.getLeft();
        }
       return result.getRight();
    }
}