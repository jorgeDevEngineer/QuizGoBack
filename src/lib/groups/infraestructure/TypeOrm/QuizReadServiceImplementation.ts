import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { QuizReadService } from "../../domain/port/QuizReadService";
import { QuizId, UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { TypeOrmQuizEntity } from "../../../kahoot/infrastructure/TypeOrm/TypeOrmQuizEntity";

export class TypeOrmQuizReadService implements QuizReadService {
  constructor(
    @InjectRepository(TypeOrmQuizEntity)
    private readonly quizRepo: Repository<TypeOrmQuizEntity>,
  ) {}

  async quizBelongsToUser(quizId: QuizId, userId: UserId): Promise<boolean> {
    const quiz = await this.quizRepo.findOne({
      where: {
        id: quizId.value,
        userId: userId.value,
      },
    });

    return !!quiz;
  }
}