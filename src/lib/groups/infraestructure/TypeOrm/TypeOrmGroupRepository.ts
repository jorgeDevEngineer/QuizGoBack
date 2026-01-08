import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In} from "typeorm";
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

@Injectable()
export class TypeOrmGroupRepository implements GroupRepository {
  constructor(
    @InjectRepository(GroupOrmEntity)
    private readonly ormRepo: Repository<GroupOrmEntity>,

    @InjectRepository(GroupMemberOrmEntity)
    private readonly memberRepo: Repository<GroupMemberOrmEntity>,

    @InjectRepository(GroupQuizAssignmentOrmEntity)
    private readonly groupQuizAssignmentRepo: Repository<GroupQuizAssignmentOrmEntity>,

    @InjectRepository(TypeOrmQuizEntity) private readonly quizRepo: Repository<TypeOrmQuizEntity>,

    @InjectRepository(TypeOrmSinglePlayerGameEntity) private readonly gameRepo: Repository<TypeOrmSinglePlayerGameEntity>,
  ) {}

 

  async findAssignmentsByGroupId(groupId: GroupId): Promise<GroupQuizAssignmentPrimitive[]> {
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

  // Filtramos sólo los que tienen completedAt
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

  //traer assignments del grupo
  const assignments = await this.findAssignmentsByGroupId(groupId);
  const quizIds = assignments
    .filter(a => a.isActive) 
    .map(a => a.quizId);

  if (quizIds.length === 0 || memberUserIds.length === 0) return [];

  //aggregate en asyncgame
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


  //Metodos de la interface GroupRepository

  async save(group: Group): Promise<void> {
  //se trae el grupo de la base de datos si existe 
    let groupOrm = await this.ormRepo.findOne({
      where: { id: group.id.value },
      relations: ["members"],
    });
  //si no existe se crea uno nuevo
    if (!groupOrm) {
      groupOrm = new GroupOrmEntity();
      groupOrm.id = group.id.value;
      groupOrm.createdAt = group.createdAt;
      groupOrm.members = [];
    }
  //si existe se mantiene y se actualizan los campos
    groupOrm.name = group.name.value;
    groupOrm.description = group.description?.value ?? "";
    groupOrm.adminId = group.adminId.value;
    groupOrm.updatedAt = group.updatedAt;
    groupOrm.invitationToken = group.invitationToken?.token ?? null;
    groupOrm.invitationExpiresAt = group.invitationToken?.expiresAt ?? null;

  //borrar los miembros que ya no estan en el dominio
    const existingMembers = groupOrm.members ?? [];
    const domainUserIds = new Set(group.members.map((m) => m.userId.value));

    const membersToDelete = existingMembers.filter(
      (m) => !domainUserIds.has(m.userId),
    );
    if (membersToDelete.length > 0) {
      await this.memberRepo.remove(membersToDelete);
    }
  //sincronizar los miembros y asignaciones con el estado en el domain
    groupOrm.members = this.syncMembers(groupOrm, group.members);
    groupOrm.assignments = this.syncAssignments(groupOrm, group.quizAssignments);
  //guardar los cambios en la base de datos
    await this.ormRepo.save(groupOrm);
  }

  //buscar un grupo por su id
  async findById(id: GroupId): Promise<Group | null> {
    const orm = await this.ormRepo.findOne({
      where: { id: id.value },
      relations: ["members"],
    });

    if (!orm) return null;
    return this.mapToDomain(orm);
  }

  async findByMember(userId: UserId): Promise<Group[]> {
  //buscar los grupos donde el usuario es miembro
    const rows = await this.ormRepo
      .createQueryBuilder("g")
      .innerJoin("g.members", "m", "m.userId = :userId", {
        userId: userId.value,
      })
      .select("g.id", "id")
      .getRawMany<{ id: string }>();

    if (rows.length === 0) return [];
    const ids = rows.map((r) => r.id);

    //traer los grupos completos por sus ids
    const orms = await this.ormRepo.find({
      where: { id: In(ids) },
      relations: ["members"],
    });

    return orms.map((orm) => this.mapToDomain(orm));
  }

  async findByInvitationToken(token: string): Promise<Group | null> {
    const orm = await this.ormRepo.findOne({
      where: { invitationToken: token },
      relations: ["members"],
    });

    if (!orm) return null;
    return this.mapToDomain(orm);
  }

//metodos privados de mapeo y sincronizacion

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
  // actualizar registro existente
      if (existing) {
        existing.role = member.role.value;
        existing.joinedAt = member.joinedAt;
        existing.completedQuizzes = member.completedQuizzes;
        nextMembers.push(existing);
      } else {// crear nuevo registro
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
    return GroupInvitationToken.create(
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