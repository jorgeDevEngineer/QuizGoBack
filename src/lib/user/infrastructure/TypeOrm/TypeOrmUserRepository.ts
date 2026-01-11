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
import { DynamicMongoAdapter } from "../../../shared/infrastructure/database/dynamic-mongo.adapter";
import { Injectable } from "@nestjs/common";
import { Collection, Db } from "mongodb";

interface UserMongoDoc {
  _id: string;
  userName: string;
  email: string;
  hashedPassword: string;
  userType: "student" | "teacher" | "personal";
  avatarUrl: string;
  name: string;
  description?: string;
  roles?: ("user" | "admin")[];
  theme: string;
  language: string;
  gameStreak: number;
  createdAt: Date;
  updatedAt: Date;
  membershipType?: "free" | "premium";
  membershipStartedAt?: Date;
  membershipExpiresAt?: Date;
  status: "Active" | "Blocked";
  isAdmin?: boolean;
}

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(TypeOrmUserEntity)
    private readonly pgRepository: Repository<TypeOrmUserEntity>,
    private readonly mongoAdapter: DynamicMongoAdapter
  ) {}

  private async getMongoCollection(): Promise<Collection<UserMongoDoc>> {
    const db: Db = await this.mongoAdapter.getConnection("user");
    return db.collection<UserMongoDoc>("users");
  }

  private mapToDomain(entity: TypeOrmUserEntity): User {
    return new User(
      new UserName(entity.userName),
      new UserEmail(entity.email),
      new UserHashedPassword(entity.hashedPassword),
      new UserType(entity.userType),
      new UserAvatarUrl(entity.avatarUrl),
      new UserId(entity.id),
      new UserPlainName(entity.name),
      entity.description,
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
      new UserStatus(entity.status),
      entity.isAdmin,
      (entity as any).roles && (entity as any).roles.length
        ? (entity as any).roles
        : ["user"]
    );
  }

  private mapMongoToDomain(doc: UserMongoDoc): User {
    return new User(
      new UserName(doc.userName),
      new UserEmail(doc.email),
      new UserHashedPassword(doc.hashedPassword),
      new UserType(doc.userType),
      new UserAvatarUrl(doc.avatarUrl),
      new UserId(doc._id),
      new UserPlainName(doc.name),
      doc.description,
      new UserTheme(doc.theme),
      new UserLanguage(doc.language),
      new UserGameStreak(doc.gameStreak),
      new Membership(
        new MembershipType(doc.membershipType || "free"),
        new MembershipDate(doc.membershipStartedAt),
        new MembershipDate(doc.membershipExpiresAt)
      ),
      new UserDate(doc.createdAt),
      new UserDate(doc.updatedAt),
      new UserStatus(doc.status),
      doc.isAdmin || false,
      doc.roles && doc.roles.length ? doc.roles : ["user"]
    );
  }

  private mapDomainToMongo(user: User): UserMongoDoc {
    return {
      _id: user.id.value,
      userName: user.userName.value,
      email: user.email.value,
      hashedPassword: user.hashedPassword.value,
      userType: user.userType.value,
      avatarUrl: user.avatarUrl.value,
      name: user.name.value,
      description: user.description,
      roles: user.roles,
      theme: user.theme.value,
      language: user.language.value,
      gameStreak: user.gameStreak.value,
      membershipType: user.membership.type.value,
      membershipStartedAt: user.membership.startedAt.value,
      membershipExpiresAt: user.membership.expiresAt.value,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt.value,
      updatedAt: user.updatedAt.value,
      status: user.status.value,
    };
  }

  async getAll(): Promise<User[]> {
    try {
      const collection = await this.getMongoCollection();
      const docs = await collection.find({}).toArray();
      return docs.map((doc) => this.mapMongoToDomain(doc));
    } catch (error) {
      console.log(
        "MongoDB connection not available, falling back to PostgreSQL for getAll operation."
      );
      const users = await this.pgRepository.find();
      return users.map((user) => this.mapToDomain(user));
    }
  }

  async getOneById(id: UserId): Promise<User | null> {
    try {
      const collection = await this.getMongoCollection();
      const doc = await collection.findOne({ _id: id.value });
      if (!doc) return null;
      return this.mapMongoToDomain(doc);
    } catch (error) {
      console.log(
        "MongoDB connection not available, falling back to PostgreSQL for getOneById operation."
      );
      const user = await this.pgRepository.findOne({ where: { id: id.value } });
      if (!user) return null;
      return this.mapToDomain(user);
    }
  }

  async getOneByName(name: UserName): Promise<User | null> {
    try {
      const collection = await this.getMongoCollection();
      const doc = await collection.findOne({ userName: name.value });
      if (!doc) return null;
      return this.mapMongoToDomain(doc);
    } catch (error) {
      console.log(
        "MongoDB connection not available, falling back to PostgreSQL for getOneByName operation."
      );
      const user = await this.pgRepository.findOne({
        where: { userName: name.value },
      });
      if (!user) return null;
      return this.mapToDomain(user);
    }
  }

  async getOneByEmail(email: UserEmail): Promise<User | null> {
    try {
      const collection = await this.getMongoCollection();
      const doc = await collection.findOne({ email: email.value });
      if (!doc) return null;
      return this.mapMongoToDomain(doc);
    } catch (error) {
      console.log(
        "MongoDB connection not available, falling back to PostgreSQL for getOneByEmail operation."
      );
      const user = await this.pgRepository.findOne({
        where: { email: email.value },
      });
      if (!user) return null;
      return this.mapToDomain(user);
    }
  }

  async create(user: User): Promise<void> {
    try {
      const collection = await this.getMongoCollection();
      const doc = this.mapDomainToMongo(user);
      await collection.insertOne(doc);
    } catch (error) {
      console.log(
        "MongoDB connection not available, falling back to PostgreSQL for create operation."
      );
      const userEntity = this.pgRepository.create({
        id: user.id.value,
        userName: user.userName.value,
        email: user.email.value,
        hashedPassword: user.hashedPassword.value,
        userType: user.userType.value,
        avatarUrl: user.avatarUrl.value,
        name: user.name.value,
        description: user.description,
        roles: user.roles,
        theme: user.theme.value,
        language: user.language.value,
        gameStreak: user.gameStreak.value,
        isAdmin: user.isAdmin,
        membershipType: user.membership.type.value,
        membershipStartedAt: user.membership.startedAt.value,
        membershipExpiresAt: user.membership.expiresAt.value,
        createdAt: user.createdAt.value,
        updatedAt: user.updatedAt.value,
        status: user.status.value,
      });
      await this.pgRepository.save(userEntity);
    }
  }

  async edit(user: User): Promise<void> {
    try {
      const collection = await this.getMongoCollection();
      const doc = this.mapDomainToMongo(user);
      await collection.updateOne({ _id: user.id.value }, { $set: doc });
    } catch (error) {
      console.log(
        "MongoDB connection not available, falling back to PostgreSQL for edit operation."
      );
      await this.pgRepository.update(user.id.value, {
        userName: user.userName.value,
        email: user.email.value,
        hashedPassword: user.hashedPassword.value,
        userType: user.userType.value,
        avatarUrl: user.avatarUrl.value,
        name: user.name.value,
        description: user.description,
        roles: user.roles,
        theme: user.theme.value,
        language: user.language.value,
        gameStreak: user.gameStreak.value,
        isAdmin: user.isAdmin,
        membershipType: user.membership.type.value,
        membershipStartedAt: user.membership.startedAt.value,
        membershipExpiresAt: user.membership.expiresAt.value,
        updatedAt: user.updatedAt.value,
        status: user.status.value,
      });
    }
  }

  async delete(id: UserId): Promise<void> {
    try {
      const collection = await this.getMongoCollection();
      await collection.deleteOne({ _id: id.value });
    } catch (error) {
      console.log(
        "MongoDB connection not available, falling back to PostgreSQL for delete operation."
      );
      await this.pgRepository.delete(id.value);
    }
  }
}
