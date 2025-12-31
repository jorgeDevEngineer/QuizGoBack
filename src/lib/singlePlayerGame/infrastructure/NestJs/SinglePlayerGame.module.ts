import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmSinglePlayerGameEntity } from "../TypeOrm/TypeOrmSinglePlayerGameEntity";
import { KahootModule } from "src/lib/kahoot/infrastructure/NestJs/kahoot.module";
import { SinglePlayerGameController } from "./SinglePlayerGame.controller";
import { TypeOrmSinglePlayerGameRepository } from "../TypeOrm/TypeOrmSinglePlayerGameRepository";
import { SinglePlayerGameRepository } from "../../domain/repositories/SinglePlayerGameRepository";
import { QuizRepository } from "src/lib/kahoot/domain/port/QuizRepository";
import { SinglePlayerEvaluationService } from "../../domain/services/SinglePlayerEvaluationService";
import { StartSinglePlayerGameCommandHandler } from "../../application/handlers/StartSinglePlayerGameCommandHandler";
import { SubmitGameAnswerCommandHandler } from "../../application/handlers/SubmitGameAnswerCommandHandler";
import { GetGameProgressQueryHandler } from "../../application/handlers/GetGameProgressQueryHandler";
import { GetGameSummaryQueryHandler } from "../../application/handlers/GetGameSummaryQueryHandler";
import { CryptoUuidGenerator } from "src/lib/shared/infrastructure/adapters/CryptoUuidGenerator";

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
            provide: 'UuidGenerator',
            useClass: CryptoUuidGenerator
        },
        {
            provide: 'StartSinglePlayerGameCommandHandler',
            useFactory: (
                gameRepo: SinglePlayerGameRepository,
                quizRepo: QuizRepository,
                uuidGenerator: CryptoUuidGenerator,
            ) => new StartSinglePlayerGameCommandHandler(gameRepo, quizRepo, uuidGenerator),
            inject: ['SinglePlayerGameRepository', 'QuizRepository', 'UuidGenerator'],
        },
        {
            provide: 'GetGameProgressQueryHandler',
            useFactory: (
                gameRepo: SinglePlayerGameRepository,
                quizRepo: QuizRepository,
            ) => new GetGameProgressQueryHandler(gameRepo, quizRepo),
            inject: ['SinglePlayerGameRepository', 'QuizRepository'],
        },
        {
            provide: 'SubmitGameAnswerCommandHandler',
            useFactory: (
                gameRepo: SinglePlayerGameRepository,
                quizRepo: QuizRepository,
                evaluationService: SinglePlayerEvaluationService,
            ) => new SubmitGameAnswerCommandHandler(gameRepo, quizRepo, evaluationService),
            inject: [
                'SinglePlayerGameRepository', 
                'QuizRepository', 
                SinglePlayerEvaluationService, 
            ],
        },
        {
            provide: 'GetGameSummaryQueryHandler',
            useFactory: (
                gameRepo: SinglePlayerGameRepository,
            ) => new GetGameSummaryQueryHandler(gameRepo),
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