import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put
} from '@nestjs/common';
import { CreateQuizUseCase, CreateQuizDto } from '../../application/CreateQuizUseCase';
import { GetQuizUseCase } from '../../application/GetQuizUseCase';
import { ListUserQuizzesUseCase } from '../../application/ListUserQuizzesUseCase';
import { UpdateQuizUseCase } from '../../application/UpdateQuizUseCase';
import { DeleteQuizUseCase } from '../../application/DeleteQuizUseCase';
import { IsString, Length } from 'class-validator';
import { QuizNotFoundError } from '../../domain/QuizNotFoundError';

export class FindOneParams {
  @IsString()
  @Length(5, 255)
  id: string;
}

@Controller('kahoots')
export class KahootController {
  constructor(
    @Inject('CreateQuizUseCase')
    private readonly createQuizUseCase: CreateQuizUseCase,
    @Inject('GetQuizUseCase')
    private readonly getQuizUseCase: GetQuizUseCase,
    @Inject('ListUserQuizzesUseCase')
    private readonly listUserQuizzesUseCase: ListUserQuizzesUseCase,
    @Inject('UpdateQuizUseCase')
    private readonly updateQuizUseCase: UpdateQuizUseCase,
    @Inject('DeleteQuizUseCase')
    private readonly deleteQuizUseCase: DeleteQuizUseCase,
  ) {}

  @Get('user/:userId')
  async listUserQuizzes(@Param('userId') userId: string) {
    const quizzes = await this.listUserQuizzesUseCase.run(userId);
    return quizzes.map((q) => q.toPlainObject());
  }

  @Get(':id')
  async getOneById(@Param() params: FindOneParams) {
    try {
      const quiz = await this.getQuizUseCase.run(params.id);
      return quiz.toPlainObject();
    } catch (error) {
      if (error instanceof QuizNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Post()
  async create(@Body() body: CreateQuizDto) {
    const quiz = await this.createQuizUseCase.run(body);
    return quiz.toPlainObject();
  }

  @Put(':id')
  async edit(@Param() params: FindOneParams, @Body() body: CreateQuizDto) {
    try {
      const quiz = await this.updateQuizUseCase.run(params.id, body);
      return quiz.toPlainObject();
    } catch (error) {
      if (error instanceof QuizNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @Delete(':id')
  async delete(@Param() params: FindOneParams) {
    await this.deleteQuizUseCase.run(params.id);
  }
}
