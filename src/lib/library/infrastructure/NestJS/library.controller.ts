import { Body, Controller, Delete, HttpCode, Inject, Param, Post } from '@nestjs/common';
import { FavoriteDTO } from '../../application/DTOs/FavoriteDTO';
import { AddUserFavoriteQuizUseCase } from '../../application/AddUserFavoriteQuizUseCase';
import { DeleteUserFavoriteQuizUseCase } from '../../application/DeleteUserFavoriteQuizUseCase';


@Controller('library')
export class LibraryController {
   constructor(
       @Inject('AddUserFavoriteQuizUseCase')
       private readonly addUserFavoriteQuizUseCase: AddUserFavoriteQuizUseCase,
       @Inject('DeleteUserFavoriteQuizUseCase')
       private readonly deleteUserFavoriteQuizUseCase: DeleteUserFavoriteQuizUseCase){}

    @Post('favorites/:quizId')
    @HttpCode(201)
    async addFavorite(@Param('quizId') quizId: string, @Body() dto: FavoriteDTO): Promise<void> {
        await this.addUserFavoriteQuizUseCase.run(dto, quizId);
    }

    @Delete('favorites/:quizId')
    @HttpCode(204)
    async deleteFavorite(@Param('quizId') quizId: string, @Body() dto: FavoriteDTO): Promise<void> {
        await this.deleteUserFavoriteQuizUseCase.execute(dto.userId, quizId);
    }
}
