import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmSinglePlayerGameEntity } from "../TypeOrm/TypeOrmSinglePlayerGameEntity";
import { KahootModule } from "src/lib/kahoot/infrastructure/NestJs/kahoot.module";
import { SinglePlayerGameController } from "./SinglePlayerGame.controller";
import { TypeOrmSinglePlayerGameRepository } from "../TypeOrm/TypeOrmSinglePlayerGameRepository";
import { SinglePlayerGameRepository } from "../../domain/repositories/SinglePlayerGameRepository";
import { QuizRepository } from "src/lib/kahoot/domain/port/QuizRepository";
import { StartSinglePlayerGameUseCase } from "../../application/usecases/StartSinglePlayerGameUseCase";
import { GetGameProgressUseCase } from "../../application/usecases/GetGameProgressUseCase";
import { SinglePlayerEvaluationService } from "../../domain/services/SinglePlayerEvaluationService";
import { SubmitGameAnswerUseCase } from "../../application/usecases/SubmitGameAnswerUseCase";
import { GetGameSummaryUseCase } from "../../application/usecases/GetGameSummaryUseCase";

@Module({
    imports: [
        TypeOrmModule.forFeature([TypeOrmSinglePlayerGameEntity]), 
        KahootModule,
    ],
    controllers: [SinglePlayerGameController],
    providers: [
        {
            provide: 'SinglePlayerGameRepository',
            useClass: TypeOrmSinglePlayerGameRepository
        },
        {
            provide: 'StartSinglePlayerGameUseCase',
            useFactory: (
                gameRepo: SinglePlayerGameRepository,
                quizRepo: QuizRepository,
            ) => new StartSinglePlayerGameUseCase(gameRepo, quizRepo),
            inject: ['SinglePlayerGameRepository', 'QuizRepository'],
        },
        {
            provide: 'GetGameProgressUseCase',
            useFactory: (
                gameRepo: SinglePlayerGameRepository,
                quizRepo: QuizRepository,
            ) => new GetGameProgressUseCase(gameRepo, quizRepo),
            inject: ['SinglePlayerGameRepository', 'QuizRepository'],
        },
        {
            provide: 'SubmitGameAnswerUseCase',
            useFactory: (
                gameRepo: SinglePlayerGameRepository,
                quizRepo: QuizRepository,
                evaluationService: SinglePlayerEvaluationService,
            ) => new SubmitGameAnswerUseCase(gameRepo, quizRepo, evaluationService),
            inject: [
                'SinglePlayerGameRepository', 
                'QuizRepository', 
                SinglePlayerEvaluationService, 
            ],
        },
        {
            provide: 'GetGameSummaryUseCase',
            useFactory: (
                gameRepo: SinglePlayerGameRepository,
            ) => new GetGameSummaryUseCase(gameRepo),
            inject: ['SinglePlayerGameRepository'],
        },
        SinglePlayerEvaluationService,
    ],
    exports: [
        'SinglePlayerGameRepository',
        SinglePlayerEvaluationService,
    ],
})
export class SinglePlayerGameModule {}