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

  async getAll(): Promise<User[]> {
    const users = await this.repository.find();
    return users.map((user) => this.mapToDomain(user));
  }

  async getOneById(id: UserId): Promise<User | null> {
    const user = await this.repository.findOne({ where: { id: id.value } });
    if (!user) return null;
    return this.mapToDomain(user);
  }

  async getOneByName(name: UserName): Promise<User | null> {
    const user = await this.repository.findOne({
      where: { userName: name.value },
    });
    if (!user) return null;
    return this.mapToDomain(user);
  }

  async create(user: User): Promise<void> {
    const userEntity = this.repository.create({
      id: user.id.value,
      userName: user.userName.value,
      email: user.email.value,
      hashedPassword: user.hashedPassword.value,
      userType: user.userType.value,
      avatarUrl: user.avatarUrl.value,
      name: user.name.value,
      theme: user.theme.value,
      language: user.language.value,
      gameStreak: user.gameStreak.value,
      createdAt: user.createdAt.value,
      updatedAt: user.updatedAt.value,
    });
    await this.repository.save(userEntity);
  }

  async edit(user: User): Promise<void> {
    await this.repository.update(user.id.value, {
      userName: user.userName.value,
      email: user.email.value,
      hashedPassword: user.hashedPassword.value,
      userType: user.userType.value,
      avatarUrl: user.avatarUrl.value,
      name: user.name.value,
      theme: user.theme.value,
      language: user.language.value,
      gameStreak: user.gameStreak.value,
      updatedAt: user.updatedAt.value,
    });
  }

  async delete(id: UserId): Promise<void> {
    await this.repository.delete(id.value);
  }
}
