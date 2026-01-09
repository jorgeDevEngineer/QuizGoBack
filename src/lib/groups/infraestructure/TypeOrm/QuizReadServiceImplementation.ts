import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Collection, Db } from "mongodb"; 

import { QuizReadService } from "../../domain/port/QuizReadService";
import { QuizId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { TypeOrmQuizEntity } from "../../../kahoot/infrastructure/TypeOrm/TypeOrmQuizEntity";
import { DynamicMongoAdapter } from "src/lib/shared/infrastructure/database/dynamic-mongo.adapter"; 

@Injectable()
export class TypeOrmQuizReadService implements QuizReadService {
  private readonly logger = new Logger(TypeOrmQuizReadService.name);

  constructor(
    @InjectRepository(TypeOrmQuizEntity) 
    private readonly pgRepo: Repository<TypeOrmQuizEntity>, 
    
    private readonly mongoAdapter: DynamicMongoAdapter,
  ) {}

  private async getMongoCollection(): Promise<Collection<any>> {
    const db: Db = await this.mongoAdapter.getConnection('kahoot');
    return db.collection('quizzes');
  }

  async quizBelongsToUser(quizId: QuizId, userId: UserId): Promise<boolean> {
    try {
      const collection = await this.getMongoCollection();
      const quiz = await collection.findOne({
        _id: quizId.value,
        authorId: userId.value 
      });
      if (quiz) return true;
      return false;

    } catch (error) {
      this.logger.warn(`MongoDB check failed, falling back to TypeORM/Postgres. Error: ${error.message}`);
    }
    const quiz = await this.pgRepo.findOne({
      where: {
        id: quizId.value,
        userId: userId.value,
      },
    });

    return !!quiz;
  }
}