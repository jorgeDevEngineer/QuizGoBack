
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
  BadRequestException,
  UsePipes,
  ValidationPipe,
  Req,
  UseGuards
} from '@nestjs/common';
import { FakeCurrentUserGuard } from '../../../groups/infraestructure/NestJs/FakeCurrentUser.guard';
import { CreateQuizUseCase, CreateQuiz } from '../../application/CreateQuizUseCase'; 
import { GetQuizUseCase } from '../../application/GetQuizUseCase';
import { ListUserQuizzesUseCase } from '../../application/ListUserQuizzesUseCase';
import { UpdateQuizUseCase, UpdateQuiz } from '../../application/UpdateQuizUseCase';
import { DeleteQuizUseCase } from '../../application/DeleteQuizUseCase';
import { IsString, Length } from 'class-validator';
import { Result } from '../../../shared/Type Helpers/result';
import { GetAllKahootsUseCase } from '../../application/GetAllKahootsUseCase';
import { CreateQuizDto } from './DTOs/create-quiz.dto';
import { UpdateQuizDto } from './DTOs/update-quiz.dto';

export class FindOneParams {
  @IsString()
  @Length(36, 36)
  id: string;
}

@Controller('kahoots')
@UseGuards(FakeCurrentUserGuard)
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
    @Inject(GetAllKahootsUseCase)
    private readonly getAllKahootsUseCase: GetAllKahootsUseCase,
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

  @Get('all')
  async getAllKahoots() {
    const result = await this.getAllKahootsUseCase.execute();
    const quizzes = this.handleResult(result);
    return quizzes.map((q) => q.toPlainObject());
  }

  @Get('user/:userId')
  async listUserQuizzes(@Param('userId') userId: string) {
    const result = await this.listUserQuizzesUseCase.execute(userId);
    const quizzes = this.handleResult(result);
    return quizzes.map((q) => q.toPlainObject());
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(
    @Body() createQuizDto: CreateQuizDto,
    @Req() req: any
  ) { 
    const authorId = req.user.id;

    const createQuizData: CreateQuiz = {
      ...createQuizDto,
      authorId: authorId,
      questions: createQuizDto.questions,
    };

    const result = await this.createQuizUseCase.execute(createQuizData);
    const quiz = this.handleResult(result);
    return quiz.toPlainObject();
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async edit(
    @Param() params: FindOneParams, 
    @Body() updateQuizDto: UpdateQuizDto,
    @Req() req: any
  ) { 
    const authorId = req.user.id;

    const updateQuizData: UpdateQuiz = {
      quizId: params.id,
      authorId: authorId,
      ...updateQuizDto
    };
    const result = await this.updateQuizUseCase.execute(updateQuizData);
    const quiz = this.handleResult(result);
    return quiz.toPlainObject();
  }

  @Delete(':id')
  async delete(@Param() params: FindOneParams) {
    const result = await this.deleteQuizUseCase.execute(params.id);
    return this.handleResult(result);
  }

  @Get(':id')
  async getOneById(@Param() params: FindOneParams) {
    const result = await this.getQuizUseCase.execute(params.id);
    const quiz = this.handleResult(result);
    return quiz.toPlainObject();
  }
}
