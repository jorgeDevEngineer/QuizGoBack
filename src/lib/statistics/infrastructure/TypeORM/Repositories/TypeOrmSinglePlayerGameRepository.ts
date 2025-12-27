import { InjectRepository } from "@nestjs/typeorm";
import { SinglePlayerGameRepository } from "../../../domain/port/SinglePlayerRepository";
import { TypeOrmSinglePlayerGameEntity } from "src/lib/singlePlayerGame/infrastructure/TypeOrm/TypeOrmSinglePlayerGameEntity";
import { Injectable } from "@nestjs/common";
import { SinglePlayerGame } from "src/lib/singlePlayerGame/domain/aggregates/SinglePlayerGame";
import { GameProgressStatus, SinglePlayerGameId} from "src/lib/singlePlayerGame/domain/valueObjects/SinglePlayerGameVOs";
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { Repository, SelectQueryBuilder } from "typeorm";
import { CriteriaApplier } from "src/lib/library/domain/port/CriteriaApplier";
import { CompletedQuizQueryCriteria as QuizQueryCriteria } from "src/lib/statistics/application/Response Types/CompletedQuizQueryCriteria";

@Injectable()
export class TypeOrmSinglePlayerGameRepository implements SinglePlayerGameRepository {

    constructor(
        @InjectRepository(TypeOrmSinglePlayerGameEntity)
        private readonly gameRepo: Repository<TypeOrmSinglePlayerGameEntity>,
        private readonly criteriaApplier: CriteriaApplier<SelectQueryBuilder<TypeOrmSinglePlayerGameEntity>, QuizQueryCriteria>
    ) {}
      
      async findCompletedGames(
        playerId: UserId,
        criteria: QuizQueryCriteria
      ): Promise<{games: SinglePlayerGame[], totalGames: number}> {
        let qb = this.gameRepo.createQueryBuilder('game');
        qb.where('game.playerId = :playerId', { playerId: playerId.getValue() })
          .andWhere('game.status = :status', { status: GameProgressStatus.COMPLETED });
      
        // aplicar criterios (page, limit, etc.)
        qb = this.criteriaApplier.apply(qb, criteria, 'game');
      
        const entities = await qb.getMany();
        const totalCount = await this.gameRepo.count();
        const domainData = entities.map(entity => entity.toDomain());
        return {games: domainData, totalGames: totalCount};
      }

      async findById(gameId: SinglePlayerGameId): Promise<SinglePlayerGame | null> {
              const entity = await this.gameRepo.findOne({
                  where: { gameId: gameId.getId() }
              });
              return entity ? entity.toDomain() : null;
          }
}