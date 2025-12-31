import { InjectRepository } from "@nestjs/typeorm";
import { SinglePlayerGameRepository } from "../../domain/repositories/SinglePlayerGameRepository";
import { TypeOrmSinglePlayerGameEntity } from "./TypeOrmSinglePlayerGameEntity";
import { Injectable } from "@nestjs/common";
import { SinglePlayerGame } from "../../domain/aggregates/SinglePlayerGame";
import { SinglePlayerGameId } from "src/lib/shared/domain/ids";
import { GameProgressStatus } from "../../domain/valueObjects/SinglePlayerGameVOs";
import { QuizId, UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { Repository } from "typeorm";

@Injectable()
export class TypeOrmSinglePlayerGameRepository implements SinglePlayerGameRepository {

    constructor(
        @InjectRepository(TypeOrmSinglePlayerGameEntity)
        private readonly gameRepo: Repository<TypeOrmSinglePlayerGameEntity>,
    ) {}

    async save(game: SinglePlayerGame): Promise<void> {
        const entity = TypeOrmSinglePlayerGameEntity.fromDomain(game);
        await this.gameRepo.save(entity);
    }

    async delete(gameId: SinglePlayerGameId): Promise<void> {
        await this.gameRepo.delete(gameId.getId());
    }

    async findById(gameId: SinglePlayerGameId): Promise<SinglePlayerGame | null> {
        const entity = await this.gameRepo.findOne({
            where: { gameId: gameId.getId() }
        });

        return entity ? entity.toDomain() : null;
    }

    async findByPlayerId(playerId: UserId): Promise<SinglePlayerGame[] | null> {
        const entities = await this.gameRepo.find({
            where: { playerId: playerId.getValue() },
            order: { startedAt: 'DESC' }
        });

        return entities.map(entity => entity.toDomain());
    }

    async findInProgressGameByPlayerAndQuiz(playerId: UserId, quizId: QuizId): Promise<SinglePlayerGame | null> {
        const entity = await this.gameRepo.findOne({
            where: { 
                playerId: playerId.getValue(),
                quizId: quizId.getValue(),
                status: GameProgressStatus.IN_PROGRESS
            }
        });

        return entity ? entity.toDomain() : null;
    }

    async findInProgressGames(playerId: UserId): Promise<SinglePlayerGame[] | null> {
        const entities = await this.gameRepo.find({
            where: { 
                playerId: playerId.getValue(),
                status: GameProgressStatus.IN_PROGRESS
            },
            order: { startedAt: 'DESC' }
        });

        return entities.map(entity => entity.toDomain());
    }

    async findCompletedGames(playerId: UserId):Promise<SinglePlayerGame[] | null> {
        const entities = await this.gameRepo.find({
            where: { 
                playerId: playerId.getValue(),
                status: GameProgressStatus.COMPLETED
            },
            order: { startedAt: 'DESC' }
        });

        return entities.map(entity => entity.toDomain());
    }

}