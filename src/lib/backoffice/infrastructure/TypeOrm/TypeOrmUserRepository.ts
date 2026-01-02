import { Injectable } from "@nestjs/common";
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
import { SearchParamsDto, SearchResultDto } from "../../application/SearchUsersUseCase";
import { UserNotFoundException } from "../../../shared/exceptions/UserNotFoundException";

@Injectable()
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
      entity.status
      
    );
  }
  async searchUsers(params: SearchParamsDto): Promise<SearchResultDto> {
    const qb=this.repository.createQueryBuilder('user');
    if (params.q) {
      qb.andWhere('user.name LIKE :q', { q: `%${params.q}%` });
    }
    if (params.limit) {
      qb.take(params.limit);
    } else {
      qb.take(20);
    }
    if (params.page) {
      qb.skip((params.page - 1) * params.limit);
    } else {
      qb.skip(0);
    }

    if (params.orderBy) {
      const orderDirection = params.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      qb.orderBy(`user.${params.orderBy}`, orderDirection);
    } else {
      qb.orderBy('user.createdAt', 'DESC');
    }

    const totalCount = await qb.getCount();
    const totalPages = Math.ceil(totalCount / params.limit);
    const data = await qb.getMany();

    const resultData = data.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      createdAt: user.createdAt,
      status: user.status,
    }));



    return {
      data: resultData,
      pagination: {
        page: params.page,
        limit: params.limit,
        totalCount,
        totalPages,
      },
    };
  }

  async deleteUser(id: UserId): Promise<void> {
    await this.repository.delete(id.value);
  }

  async blockUser(id: UserId): Promise<{
    user:{
      id: string;
      name: string;
      email: string;
      userType: string;
      createdAt: Date;
      status: string;
    };
  }> {

    const user = await this.repository.findOne({ where: { id: id.value } });
    if (!user) throw new UserNotFoundException('User not found');
    user.status = 'Blocked';
    await this.repository.save(user);
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        createdAt: user.createdAt,
        status: user.status,
      },
    };
  }


}
