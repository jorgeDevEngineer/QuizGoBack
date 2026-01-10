import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Collection, Db } from "mongodb";

import { GroupRepository } from "../../domain/port/GroupRepository";
import { CompletedAttemptPrimitive, Group, GroupQuizAssignmentPrimitive, QuizBasicPrimitive } from "../../domain/entity/Group";
import { GroupId } from "../../domain/valueObject/GroupId";
import { GroupName } from "../../domain/valueObject/GroupName";
import { GroupDescription } from "../../domain/valueObject/GroupDescription";
import { GroupMember } from "../../domain/entity/GroupMember";
import { GroupRole } from "../../domain/valueObject/GroupMemberRole";
import { GroupQuizAssignment } from "../../domain/entity/GroupQuizAssigment";
import { GroupQuizAssignmentId } from "../../domain/valueObject/GroupQuizAssigmentId";
import { GroupQuizAssignmentOrmEntity } from "./GroupQuizAssigmentOrmEntity";
import { QuizId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { GroupQuizCompletion } from "../../domain/entity/GroupQuizCompletion";
import { GroupInvitationToken } from "../../domain/valueObject/GroupInvitationToken";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { GroupOrmEntity } from "./GroupOrmEntity";
import { GroupMemberOrmEntity } from "./GroupOrnMember";
import { TypeOrmSinglePlayerGameEntity } from "src/lib/singlePlayerGame/infrastructure/TypeOrm/TypeOrmSinglePlayerGameEntity";
import { TypeOrmQuizEntity } from "src/lib/search/infrastructure/TypeOrm/TypeOrmQuizEntity";
import { GameProgressStatus } from "src/lib/singlePlayerGame/domain/valueObjects/SinglePlayerGameVOs";
import { Optional } from "src/lib/shared/Type Helpers/Optional";
import { DynamicMongoAdapter } from "src/lib/shared/infrastructure/database/dynamic-mongo.adapter";

interface MongoGroupDocument {
  _id: string;
  name: string;
  description: string;
  adminId: string;
  createdAt: Date;
  updatedAt: Date;
  invitationToken: string | null;
  invitationExpiresAt: Date | null;
  members: any[];
  assignments: any[];
  // completions: any[]; 
}

@Injectable()
export class TypeOrmGroupRepository implements GroupRepository {
  private readonly logger = new Logger(TypeOrmGroupRepository.name);

  constructor(
    @InjectRepository(GroupOrmEntity)
    private readonly pgRepo: Repository<GroupOrmEntity>, 
    private readonly mongoAdapter: DynamicMongoAdapter,
    @InjectRepository(GroupMemberOrmEntity)
    private readonly memberRepo: Repository<GroupMemberOrmEntity>,

    @InjectRepository(GroupQuizAssignmentOrmEntity)
    private readonly groupQuizAssignmentRepo: Repository<GroupQuizAssignmentOrmEntity>,

    @InjectRepository(TypeOrmQuizEntity) private readonly quizRepo: Repository<TypeOrmQuizEntity>,

    @InjectRepository(TypeOrmSinglePlayerGameEntity) private readonly gameRepo: Repository<TypeOrmSinglePlayerGameEntity>,

  ) {}

  // --- HELPER MONGO ---
  private async getMongoCollection(): Promise<Collection<MongoGroupDocument>> {
    const db: Db = await this.mongoAdapter.getConnection('groups'); 
    return db.collection<MongoGroupDocument>('groups');
  }

  async save(group: Group): Promise<void> {
    try {
      const collection = await this.getMongoCollection();
      const mongoDoc = this.mapDomainToMongo(group);
      // Si existe actualiza, si no crea
      await collection.replaceOne({ _id: mongoDoc._id }, mongoDoc, { upsert: true });
      return;
    } catch (error) {
      this.logger.warn(`MongoDB save failed (or inactive), falling back to Postgres. Error: ${error.message}`);
    }
    // FALLBACK POSTGRES
    let groupOrm = await this.pgRepo.findOne({
      where: { id: group.id.value },
      relations: ["members"],
    });

    if (!groupOrm) {
      groupOrm = new GroupOrmEntity();
      groupOrm.id = group.id.value;
      groupOrm.createdAt = group.createdAt;
      groupOrm.members = [];
    }

    groupOrm.name = group.name.value;
    
    if (group.description.hasValue()) {
      groupOrm.description = group.description.getValue().value;
    } else {
      groupOrm.description = "";
    }
    
    groupOrm.adminId = group.adminId.value;
    groupOrm.updatedAt = group.updatedAt;

    if (group.invitationToken.hasValue()) {
      const token = group.invitationToken.getValue();
      groupOrm.invitationToken = token.token;
      groupOrm.invitationExpiresAt = token.expiresAt;
    } else {
      groupOrm.invitationToken = null;
      groupOrm.invitationExpiresAt = null;
    }

    const existingMembers = groupOrm.members ?? [];
    const domainUserIds = new Set(group.members.map((m) => m.userId.value));

    const membersToDelete = existingMembers.filter(
      (m) => !domainUserIds.has(m.userId),
    );
    if (membersToDelete.length > 0) {
      await this.memberRepo.remove(membersToDelete);
    }

    groupOrm.members = this.syncMembers(groupOrm, group.members);
    groupOrm.assignments = this.syncAssignments(groupOrm, group.quizAssignments);

    await this.pgRepo.save(groupOrm);
  }

  async findById(id: GroupId): Promise<Optional<Group>> {
    // 1. INTENTO MONGO
    try {
      const collection = await this.getMongoCollection();
      const doc = await collection.findOne({ _id: id.value });
      
      if (doc) {
        return new Optional(this.mapMongoToDomain(doc));
      }

      return new Optional(); 

    } catch (error) {
      this.logger.warn(`MongoDB findById failed, falling back to Postgres.`);
    }
    const orm = await this.pgRepo.findOne({
        where: { id: id.value }, 
        relations: ["members", "assignments"] 
    });
    
    const domainEntity = orm ? this.mapToDomain(orm) : undefined;
    return new Optional(domainEntity);
  }

  async findByInvitationToken(token: string): Promise<Optional<Group>> {
    // 1. INTENTO MONGO
    try {
        const collection = await this.getMongoCollection();
        const doc = await collection.findOne({ invitationToken: token });
        
        if (doc) {
          return new Optional(this.mapMongoToDomain(doc));
        }
        return new Optional();
  
      } catch (error) {
        this.logger.warn(`MongoDB findByToken failed, falling back to Postgres.`);
      }
    const orm = await this.pgRepo.findOne({ 
        where: { invitationToken: token }, 
        relations: ["members", "assignments"], 
    });

    const domainEntity = orm ? this.mapToDomain(orm) : undefined;
    return new Optional(domainEntity);
  }

  async findByMember(userId: UserId): Promise<Group[]> {
    try {
        const collection = await this.getMongoCollection();
        const docs = await collection.find({ "members.userId": userId.value }).toArray();
        
        return docs.map(doc => this.mapMongoToDomain(doc));
  
      } catch (error) {
        this.logger.warn(`MongoDB findByMember failed, falling back to Postgres.`);
      }
    const rows = await this.pgRepo
      .createQueryBuilder("g")
      .innerJoin("g.members", "m", "m.userId = :userId", {
        userId: userId.value,
      })
      .select("g.id", "id")
      .getRawMany<{ id: string }>();

    if (rows.length === 0) return [];
    const ids = rows.map((r) => r.id);

    const orms = await this.pgRepo.find({
      where: { id: In(ids) },
      relations: ["members", "assignments"],
    });

    return orms.map((orm) => this.mapToDomain(orm));
  }

  async findAssignmentsByGroupId(groupId: GroupId): Promise<GroupQuizAssignmentPrimitive[]> {
    try {
      const collection = await this.getMongoCollection();
      const doc = await collection.findOne({ _id: groupId.value });

      if (doc) {

        const assignments = doc.assignments || [];
        
        return assignments.map((a: any) => ({
          id: a.id,
          quizId: a.quizId,
          assignedBy: a.assignedBy,
          createdAt: new Date(a.createdAt), // Asegurar que sea Date
          availableFrom: a.availableFrom ? new Date(a.availableFrom) : null,
          availableUntil: a.availableUntil ? new Date(a.availableUntil) : null,
          isActive: a.isActive,
        }));
      }

      if (doc === null) return [];

    } catch (error) {
      this.logger.warn(`MongoDB findAssignments failed, falling back to Postgres.`);
    }

    const rows = await this.groupQuizAssignmentRepo.find({
      where: { group: { id: groupId.value } },
      order: { createdAt: "DESC" },
    });

    return rows.map(r => ({
      id: r.id,
      quizId: r.quizId,
      assignedBy: r.assignedBy,
      createdAt: r.createdAt,
      availableFrom: r.availableFrom ?? null,
      availableUntil: r.availableUntil ?? null,
      isActive: r.isActive,
    }));
  }

  async findQuizzesBasicByIds(quizIds: string[]): Promise<QuizBasicPrimitive[]> {
    if (quizIds.length === 0) return [];
    const quizzes = await this.quizRepo.find({
      where: { id: In(quizIds) },
      select: { id: true, title: true },
    });
    return quizzes.map(q => ({ id: q.id, title: q.title }));
  }

  async findCompletedAttemptsByUserAndQuizIds(userId: string, quizIds: string[]): Promise<CompletedAttemptPrimitive[]> {
    if (quizIds.length === 0) return [];
    const games = await this.gameRepo.find({
      where: {
        playerId: userId,
        quizId: In(quizIds),
        status: GameProgressStatus.COMPLETED,
      },
      order: { startedAt: "DESC" },
    });

    return games
      .filter(g => !!g.completedAt)
      .map(g => ({
        gameId: g.gameId,
        quizId: g.quizId,
        score: g.score,
        startedAt: g.startedAt,
        completedAt: g.completedAt!,
      }));
  }

  async getGroupLeaderboardByGroupId(
    groupId: GroupId,
    memberUserIds: string[],
  ): Promise<{ userId: string; completedQuizzes: number; totalPoints: number }[]> {
    const assignments = await this.findAssignmentsByGroupId(groupId);
    const quizIds = assignments
      .filter(a => a.isActive)
      .map(a => a.quizId);

    if (quizIds.length === 0 || memberUserIds.length === 0) return [];

    const raw = await this.gameRepo
      .createQueryBuilder("g")
      .select("g.playerId", "userId")
      .addSelect("COUNT(DISTINCT g.quizId)", "completedQuizzes")
      .addSelect("COALESCE(SUM(g.score), 0)", "totalPoints")
      .where("g.status = :status", { status: GameProgressStatus.COMPLETED })
      .andWhere("g.quizId IN (:...quizIds)", { quizIds })
      .andWhere("g.playerId IN (:...userIds)", { userIds: memberUserIds })
      .groupBy("g.playerId")
      .orderBy("COALESCE(SUM(g.score), 0)", "DESC")
      .addOrderBy("COUNT(DISTINCT g.quizId)", "DESC")
      .getRawMany<{ userId: string; completedQuizzes: string; totalPoints: string }>();

    return raw.map(r => ({
      userId: r.userId,
      completedQuizzes: Number(r.completedQuizzes ?? 0),
      totalPoints: Number(r.totalPoints ?? 0),
    }));
  }

  // --- MAPPERS PARA MONGO ---

  private mapDomainToMongo(group: Group): MongoGroupDocument {
      const plain = group.toPlainObject();
      return {
          _id: plain.id,
          name: plain.name,
          description: plain.description,
          adminId: plain.adminId,
          createdAt: new Date(plain.createdAt),
          updatedAt: new Date(plain.updatedAt),
          invitationToken: plain.invitation ? plain.invitation.token : null,
          invitationExpiresAt: plain.invitation ? new Date(plain.invitation.expiresAt) : null,
          members: plain.members, 
          assignments: plain.quizAssignments,
          // completions: plain.completions 
      };
  }

  private mapMongoToDomain(doc: MongoGroupDocument): Group {
      const members = (doc.members || []).map(m => {
          const member = GroupMember.create(
              new UserId(m.userId),
              GroupRole.fromString(m.role),
              new Date(m.joinedAt)
          );
          for(let i=0; i < (m.completedQuizzes || 0); i++) member.incrementCompletedQuizzes();
          return member;
      });
      const assignments = (doc.assignments || []).map(a => {
          const assignment = GroupQuizAssignment.create(
              GroupQuizAssignmentId.of(a.id),
              QuizId.of(a.quizId),
              new UserId(a.assignedBy),
              a.availableFrom ? new Date(a.availableFrom) : null,
              a.availableUntil ? new Date(a.availableUntil) : null,
              new Date(a.createdAt)
          );
          if (!a.isActive) assignment.deactivate();
          return assignment;
      });

      return Group.createFromdb(
          GroupId.of(doc._id),
          GroupName.of(doc.name),
          doc.description ? GroupDescription.of(doc.description) : null,
          new UserId(doc.adminId),
          members,
          assignments,
          [],
          (doc.invitationToken && doc.invitationExpiresAt) 
            ? GroupInvitationToken.fromPersistence(doc.invitationToken, new Date(doc.invitationExpiresAt))
            : null,
          new Date(doc.createdAt),
          new Date(doc.updatedAt)
      );
  }

  // --- MAPPERS Y SYNC PARA POSTGRES (ORIGINALES) ---

  private syncMembers(
    groupOrm: GroupOrmEntity,
    domainMembers: GroupMember[],
  ): GroupMemberOrmEntity[] {
    const existingByUserId = new Map<string, GroupMemberOrmEntity>();

    for (const m of groupOrm.members ?? []) {
      existingByUserId.set(m.userId, m);
    }
    const nextMembers: GroupMemberOrmEntity[] = [];

    for (const member of domainMembers) {
      const userId = member.userId.value;
      const existing = existingByUserId.get(userId);

      if (existing) {
        existing.role = member.role.value;
        existing.joinedAt = member.joinedAt;
        existing.completedQuizzes = member.completedQuizzes;
        nextMembers.push(existing);
      } else {
        const m = new GroupMemberOrmEntity();
        m.group = groupOrm;
        m.userId = userId;
        m.role = member.role.value;
        m.joinedAt = member.joinedAt;
        m.completedQuizzes = member.completedQuizzes;
        nextMembers.push(m);
      }
    }
    return nextMembers;
  }

  private syncAssignments(groupOrm: GroupOrmEntity, domainAssignments: GroupQuizAssignment[]): GroupQuizAssignmentOrmEntity[] {
    const existingById = new Map<string, GroupQuizAssignmentOrmEntity>();

    for (const a of groupOrm.assignments ?? []) {
      existingById.set(a.id, a);
    }
    const nextAssignments: GroupQuizAssignmentOrmEntity[] = [];

    for (const assignment of domainAssignments) {
      const id = assignment.id.value;
      const existing = existingById.get(id);

      if (existing) {
        existing.quizId = assignment.quizId.value;
        existing.assignedBy = assignment.assignedBy.value;
        existing.availableFrom = assignment.availableFrom;
        existing.availableUntil = assignment.availableUntil;
        existing.isActive = assignment.isActive;
        nextAssignments.push(existing);
      } 
      else {
        const a = new GroupQuizAssignmentOrmEntity();
        a.id = id;
        a.group = groupOrm;
        a.quizId = assignment.quizId.value;
        a.assignedBy = assignment.assignedBy.value;   
        a.availableFrom = assignment.availableFrom;
        a.availableUntil = assignment.availableUntil;
        a.isActive = assignment.isActive;
        nextAssignments.push(a);
      }
    }
    return nextAssignments;
  }

  private mapAssignmentsFromOrm(orm: GroupOrmEntity): GroupQuizAssignment[] {
    if (!orm.assignments || orm.assignments.length === 0) return [];
    const groupId = GroupId.of(orm.id);

    return orm.assignments.map((a) => {
      const assignment = GroupQuizAssignment.create(
        GroupQuizAssignmentId.of(a.id),
        QuizId.of(a.quizId),
        new UserId(a.assignedBy),
        a.availableFrom,
        a.availableUntil,
        a.createdAt,
      );
      assignment._setGroup(groupId);

      if (!a.isActive) {
        assignment.deactivate();
      }
      return assignment;
    });
  }
  
  private mapInvitationFromOrm(
    orm: GroupOrmEntity,
  ): GroupInvitationToken | null {
    if (!orm.invitationToken || !orm.invitationExpiresAt) {
      return null;
    }
    return GroupInvitationToken.fromPersistence(
      orm.invitationToken,
      orm.invitationExpiresAt,
    );
  }

  private mapMembersFromOrm(orm: GroupOrmEntity): GroupMember[] {
    if (!orm.members || orm.members.length === 0) {
      return [];
    }
    const groupId = GroupId.of(orm.id);

    return orm.members.map((m) => {
      const member = GroupMember.create(
        new UserId(m.userId),
        GroupRole.fromString(m.role),
        m.joinedAt,
      );
      member._setGroup(groupId);

      for (let i = 0; i < m.completedQuizzes; i++) {
        member.incrementCompletedQuizzes();
      }
      return member;
    });
  }

  private emptyCompletions(): GroupQuizCompletion[] {
    return [];
  }

  private mapToDomain(orm: GroupOrmEntity): Group {
    const members = this.mapMembersFromOrm(orm);
    const assignments = this.mapAssignmentsFromOrm(orm);
    const invitation = this.mapInvitationFromOrm(orm);

    return Group.createFromdb(
      GroupId.of(orm.id),
      GroupName.of(orm.name),
      GroupDescription.of(orm.description ?? ""),
      new UserId(orm.adminId),

      members,
      assignments,
      this.emptyCompletions(),
      invitation,
      orm.createdAt,
      orm.updatedAt,
    );
  }
}