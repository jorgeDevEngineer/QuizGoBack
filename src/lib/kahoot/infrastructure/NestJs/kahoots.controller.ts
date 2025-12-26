
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
import { UpdateQuizUseCase, UpdateQuizDto } from '../../application/UpdateQuizUseCase';
import { DeleteQuizUseCase } from '../../application/DeleteQuizUseCase';
import { IsString, Length } from 'class-validator';

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
    const quizzes = await this.listUserQuizzesUseCase.execute(userId);
    return quizzes.map((q) => q.toPlainObject());
  }

  @Get(':id')
  async getOneById(@Param() params: FindOneParams) {
    const quiz = await this.getQuizUseCase.execute(params.id);
    return quiz.toPlainObject();
  }

  @Post()
  async create(@Body() body: CreateQuizDto) {
    const quiz = await this.createQuizUseCase.execute(body);
    return quiz.toPlainObject();
  }

  @Put(':id')
  async edit(@Param() params: FindOneParams, @Body() body: CreateQuizDto) {
    const updateQuizDto: UpdateQuizDto = {
      ...body,
      quizId: params.id
    };
    const quiz = await this.updateQuizUseCase.execute(updateQuizDto);
    return quiz.toPlainObject();
  }

  @Delete(':id')
  async delete(@Param() params: FindOneParams) {
    await this.deleteQuizUseCase.execute(params.id);
  }
}
