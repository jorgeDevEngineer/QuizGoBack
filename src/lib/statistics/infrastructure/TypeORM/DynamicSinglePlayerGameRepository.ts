import { InjectRepository } from "@nestjs/typeorm";
import { SinglePlayerGameRepository } from "../../domain/port/SinglePlayerRepository";
import { TypeOrmSinglePlayerGameEntity } from "src/lib/singlePlayerGame/infrastructure/TypeOrm/TypeOrmSinglePlayerGameEntity";
import { Injectable } from "@nestjs/common";
import { SinglePlayerGame } from "src/lib/singlePlayerGame/domain/aggregates/SinglePlayerGame";
import { GameProgressStatus } from "src/lib/singlePlayerGame/domain/valueObjects/SinglePlayerGameVOs";
import { SinglePlayerGameId } from "src/lib/shared/domain/ids";
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { Repository } from "typeorm";
import { CompletedQuizQueryCriteria } from "src/lib/statistics/application/Response Types/CompletedQuizQueryCriteria";
import { DynamicMongoAdapter } from "src/lib/shared/infrastructure/database/dynamic-mongo.adapter";
import { TypeOrmPostgresCriteriaApplier } from "./Criteria Appliers/Postgres/TypeOrmPostgresCriteriaApplier";
import { MongoCriteriaApplier, MongoFindParams } from "./Criteria Appliers/Mongo/MongoCriteriaApplier";

@Injectable()
export class DynamicSinglePlayerGameRepository implements SinglePlayerGameRepository {

  constructor(
    private readonly gameRepo: Repository<TypeOrmSinglePlayerGameEntity>,
    private readonly pgCriteriaApplier: TypeOrmPostgresCriteriaApplier<TypeOrmSinglePlayerGameEntity>,
    private readonly mongoAdapter: DynamicMongoAdapter,
    private readonly mongoCriteriaApplier: MongoCriteriaApplier<any>) { }

  async findCompletedGames(playerId: UserId, criteria: CompletedQuizQueryCriteria) {
    try {
      const db = this.mongoAdapter.getConnection('singlePlayerGame');
      const collection = (await db).collection('singlePlayerGame');

      // Filtro Base
      const baseFilter: MongoFindParams<any> = {
        filter: {
          playerId: playerId.value,
          status: GameProgressStatus.COMPLETED
        }
      };

      // Aplicar Criterios
      const { filter, options } = this.mongoCriteriaApplier.apply(baseFilter, criteria);

      // Ejecutar Consulta
      const results = await collection.find(filter, options).toArray();
      return null;
    } catch (error) {
      let qb = this.gameRepo.createQueryBuilder('game'); 
      qb.where('game.playerId = :playerId', { playerId: playerId.getValue() })
      .andWhere('game.status = :status', { status: GameProgressStatus.COMPLETED }); 

      qb = this.pgCriteriaApplier.apply(qb, criteria, 'game');
  
      const entities = await qb.getMany();
      const totalCount = await this.gameRepo.count();
      const domainData = entities.map(entity => entity.toDomain());
      return {games: domainData, totalGames: totalCount};
    }
  }

  async findById(gameId: SinglePlayerGameId): Promise<SinglePlayerGame | null>{
     try{
       const db = this.mongoAdapter.getConnection("singlePlayerGame");
       const collection = (await db).collection("singlePlayerGame");

      const id = gameId.getId();
      const doc = await collection.findOne({ id: id });
      return null;
     }catch(error){
      const entity = await this.gameRepo.findOne({
        where: { gameId: gameId.getId() },
      });
      return entity ? entity.toDomain() : null;
     }
  }
}
