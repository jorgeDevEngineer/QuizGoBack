import { Body, Controller, Delete, Get, HttpCode, HttpException, Inject, Param, Post, Query } from '@nestjs/common';
import { UserIdDTO } from '../../application/DTOs/UserIdDTO';
import { AddUserFavoriteQuizUseCase } from '../../application/Services/AddUserFavoriteQuizUseCase';
import { DeleteUserFavoriteQuizUseCase } from '../../application/Services/DeleteUserFavoriteQuizUseCase';
import { GetAllUserQuizzesUseCase } from '../../application/Services/GetAllUserQuizzesUseCase';
import { GetUserFavoriteQuizzesUseCase } from '../../application/Services/GetUserFavoriteQuizzesUseCase';
import { QuizResponse } from '../../application/Response Types/QuizResponse';
import { QueryParamsInput } from '../../application/DTOs/QueryParamsDTO';
import { QueryResponse } from '../../application/Response Types/QueryResponse';

@Controller('library')
export class LibraryController {
   constructor(
       @Inject('AddUserFavoriteQuizUseCase')
       private readonly addUserFavoriteQuizUseCase: AddUserFavoriteQuizUseCase,
       @Inject('DeleteUserFavoriteQuizUseCase')
       private readonly deleteUserFavoriteQuizUseCase: DeleteUserFavoriteQuizUseCase,
       @Inject('GetUserFavoriteQuizzesUseCase')
       private readonly getUserFavoriteQuizzesUseCase: GetUserFavoriteQuizzesUseCase,
       @Inject('GetAllUserQuizzesUseCase')
       private readonly getAllUserQuizzesUseCase: GetAllUserQuizzesUseCase,
    ){}

    @Post('favorites/:quizId')
    @HttpCode(201)
    async addFavorite(@Param('quizId') quizId: string, @Body() dto: UserIdDTO): Promise<void> {
        const result = await this.addUserFavoriteQuizUseCase.run(dto, quizId);
        if(result.isLeft()){
            throw result.getLeft();
        }
        return result.getRight();
    }

    @Delete('favorites/:quizId')
    @HttpCode(204)
    async deleteFavorite(@Param('quizId') quizId: string, @Body() dto: UserIdDTO): Promise<void> {
        const result = await this.deleteUserFavoriteQuizUseCase.run(dto, quizId);
        if(result.isLeft()){
            throw result.getLeft();
        }
        return result.getRight();
    }

    @Get('favorites')
    @HttpCode(200)
    async getFavorites(@Body() dto: UserIdDTO, @Query() queryParams: QueryParamsInput): Promise<QueryResponse<QuizResponse>> {
        const result = await this.getUserFavoriteQuizzesUseCase.execute(dto.userId, queryParams);
        if(result.isLeft()){
            throw result.getLeft();
        }
        return result.getRight();
    }

    @Get('my-creations')
    @HttpCode(200)
    async getMyCreations(@Body() dto: UserIdDTO, @Query() queryParams: QueryParamsInput): Promise<QueryResponse<QuizResponse>> {
        const result = await this.getAllUserQuizzesUseCase.run(dto, queryParams);
        if(result.isLeft()){
            throw result.getLeft();
        }
        return result.getRight();
    }
}