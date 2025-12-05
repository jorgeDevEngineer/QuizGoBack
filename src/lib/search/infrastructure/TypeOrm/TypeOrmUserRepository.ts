import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../../domain/entity/User";
import { UserRepository } from "../../domain/port/UserRepository";
import { UserName } from "../../domain/valueObject/UserName";
import { TypeOrmUserEntity } from "./TypeOrmUserEntity";
import { UserId } from "../../domain/valueObject/UserId";

export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(TypeOrmUserEntity)
    private readonly repository: Repository<TypeOrmUserEntity>
  ) {}

  private mapToDomain(entity: TypeOrmUserEntity): User {
    return new User(
      entity.id,
      entity.userName,
      entity.email,
      entity.hashedPassword,
      entity.userType,
      entity.avatarUrl,
      entity.name,
      entity.theme,
      entity.language,
      entity.gameStreak,
      entity.createdAt,
      entity.updatedAt
    );
  }


  async getNameById(id: string): Promise<string> {
    const user = await this.repository.findOne({ where: { id: id } });
    if (!user) throw new Error('User not found');
    return user.name;
  }
}
