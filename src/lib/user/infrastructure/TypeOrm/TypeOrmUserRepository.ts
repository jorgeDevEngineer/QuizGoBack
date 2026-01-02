import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../../domain/aggregate/User";
import { UserRepository } from "../../domain/port/UserRepository";
import { UserName } from "../../domain/valueObject/UserName";
import { TypeOrmUserEntity } from "./TypeOrmUserEntity";
import { UserId } from "../../domain/valueObject/UserId";
import { UserEmail } from "../../domain/valueObject/UserEmail";
import { UserHashedPassword } from "../../domain/valueObject/UserHashedPassword";
import { UserType } from "../../domain/valueObject/UserType";
import { UserAvatarUrl } from "../../domain/valueObject/UserAvatarUrl";
import { UserPlainName } from "../../domain/valueObject/UserPlainName";
import { UserTheme } from "../../domain/valueObject/UserTheme";
import { UserLanguage } from "../../domain/valueObject/UserLanguaje";
import { UserGameStreak } from "../../domain/valueObject/UserGameStreak";
import { UserDate } from "../../domain/valueObject/UserDate";
import { Membership } from "../../domain/entity/Membership";
import { MembershipType } from "../../domain/valueObject/MembershipType";
import { MembershipDate } from "../../domain/valueObject/MembershipDate";
import { UserStatus } from "../../domain/valueObject/UserStatus";

export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(TypeOrmUserEntity)
    private readonly repository: Repository<TypeOrmUserEntity>
  ) {}

  private mapToDomain(entity: TypeOrmUserEntity): User {
    return new User(
      new UserName(entity.userName),
      new UserEmail(entity.email),
      new UserHashedPassword(entity.hashedPassword),
      new UserType(entity.userType),
      new UserAvatarUrl(entity.avatarUrl),
      new UserId(entity.id),
      new UserPlainName(entity.name),
      new UserTheme(entity.theme),
      new UserLanguage(entity.language),
      new UserGameStreak(entity.gameStreak),
      new Membership(
        new MembershipType(entity.membershipType),
        new MembershipDate(entity.membershipStartedAt),
        new MembershipDate(entity.membershipExpiresAt)
      ),
      new UserDate(entity.createdAt),
      new UserDate(entity.updatedAt),
      new UserStatus(entity.status)
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
      membershipType: user.membership.type.value,
      membershipStartedAt: user.membership.startedAt.value,
      membershipExpiresAt: user.membership.expiresAt.value,
      createdAt: user.createdAt.value,
      updatedAt: user.updatedAt.value,
      status: user.status.value,
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
      membershipType: user.membership.type.value,
      membershipStartedAt: user.membership.startedAt.value,
      membershipExpiresAt: user.membership.expiresAt.value,
      updatedAt: user.updatedAt.value,
      status: user.status.value,
    });
  }

  async delete(id: UserId): Promise<void> {
    await this.repository.delete(id.value);
  }
}
