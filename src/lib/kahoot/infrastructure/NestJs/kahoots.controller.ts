
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  HttpException,
  HttpStatus,
  BadRequestException
} from '@nestjs/common';
import { CreateQuizUseCase, CreateQuiz } from '../../application/CreateQuizUseCase'; 
import { GetQuizUseCase } from '../../application/GetQuizUseCase';
import { ListUserQuizzesUseCase } from '../../application/ListUserQuizzesUseCase';
import { UpdateQuizUseCase, UpdateQuizDto } from '../../application/UpdateQuizUseCase';
import { DeleteQuizUseCase } from '../../application/DeleteQuizUseCase';
import { IsString, Length } from 'class-validator';
import { Result } from '../../../shared/Type Helpers/result';

export class FindOneParams {
  @IsString()
  @Length(5, 255)
  id: string;
}

@Controller('kahoots')
export class KahootController {
  constructor(
    @Inject(CreateQuizUseCase)
    private readonly createQuizUseCase: CreateQuizUseCase,
    @Inject(GetQuizUseCase)
    private readonly getQuizUseCase: GetQuizUseCase,
    @Inject(ListUserQuizzesUseCase)
    private readonly listUserQuizzesUseCase: ListUserQuizzesUseCase,
    @Inject(UpdateQuizUseCase)
    private readonly updateQuizUseCase: UpdateQuizUseCase,
    @Inject(DeleteQuizUseCase)
    private readonly deleteQuizUseCase: DeleteQuizUseCase,
  ) {}

  private handleResult<T>(result: Result<T>) {
    if (result.isFailure) {
      if (result.error.toLowerCase().includes('not found')) {
        throw new NotFoundException(result.error);
      }
      throw new BadRequestException(result.error);
    }
    return result.getValue();
  }

  @Get('user/:userId')
  async listUserQuizzes(@Param('userId') userId: string) {
    const result = await this.listUserQuizzesUseCase.execute(userId);
    const quizzes = this.handleResult(result);
    return quizzes.map((q) => q.toPlainObject());
  }

  @Get(':id')
  async getOneById(@Param() params: FindOneParams) {
    const result = await this.getQuizUseCase.execute(params.id);
    const quiz = this.handleResult(result);
    return quiz.toPlainObject();
  }

  @Post()
  async create(@Body() body: CreateQuiz) { 
    const result = await this.createQuizUseCase.execute(body);
    const quiz = this.handleResult(result);
    return quiz.toPlainObject();
  }

  @Put(':id')
  async edit(@Param() params: FindOneParams, @Body() body: CreateQuiz) { 
    const updateQuizDto: UpdateQuizDto = {
      ...body,
      quizId: params.id
    };
    const result = await this.updateQuizUseCase.execute(updateQuizDto);
    const quiz = this.handleResult(result);
    return quiz.toPlainObject();
  }

  @Delete(':id')
  async delete(@Param() params: FindOneParams) {
    const result = await this.deleteQuizUseCase.execute(params.id);
    return this.handleResult(result);
  }
}
