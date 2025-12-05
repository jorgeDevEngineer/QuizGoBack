import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { GroupsController } from "./Group.controller";

import { GroupOrmEntity } from "../TypeOrm/GroupOrmEntity";
import { GroupMemberOrmEntity } from "../TypeOrm/GroupOrnMember";
import { GroupQuizAssignmentOrmEntity } from "../TypeOrm/GroupQuizAssigmentOrmEntity";
import { TypeOrmGroupRepository } from "../TypeOrm/TypeOrmGroupRepository";

import { GroupRepository } from "../../domain/port/GroupRepository";
import { InvitationTokenGenerator } from "../../domain/port/GroupInvitationTokenGenerator";
import { cryptoInvitationTokenGenerator } from "../Token/InvitationTokenGenerator";

import { CreateGroupUseCase } from "../../application/CrearteGroupUseCase";
import { GetUserGroupsUseCase } from "../../application/GetUserGroupsUseCase";
import { GetGroupDetailUseCase } from "../../application/GroupDetailsUseCase";
import { GenerateGroupInvitationUseCase } from "../../application/GenerateGroupInvitationUseCase";
import { JoinGroupByInvitationUseCase } from "../../application/JoinGroupByInvitation";
import { LeaveGroupUseCase } from "../../application/LeaveGroupUseCase";
import { RemoveGroupMemberUseCase } from "../../application/RemoveGroupMemberUseCase";
import { UpdateGroupInfoUseCase } from "../../application/UpdateGroupDetailsUseCase";
import { TransferGroupAdminUseCase } from "../../application/TransferGroupAdminUseCase";
import { GetGroupMembersUseCase } from "../../application/GetGroupMembers";
import { AssignQuizToGroupUseCase } from "../../application/AssignQuizToGroupUseCase";

import { TypeOrmQuizEntity } from "../../../kahoot/infrastructure/TypeOrm/TypeOrmQuizEntity";
import { TypeOrmQuizReadService } from "../TypeOrm/QuizReadServiceImplementation";
import { QuizReadService } from "../../domain/port/QuizReadService";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GroupOrmEntity,
      GroupMemberOrmEntity,
      GroupQuizAssignmentOrmEntity,
      TypeOrmQuizEntity,
    ]),
  ],
  controllers: [GroupsController],
  providers: [
    {
      provide: "GroupRepository",
      useClass: TypeOrmGroupRepository,
    },
    {
      provide: "InvitationTokenGenerator",
      useValue: cryptoInvitationTokenGenerator,
    },
    {
      provide: "QuizReadService",
      useClass: TypeOrmQuizReadService,
    },

    {
      provide: CreateGroupUseCase,
      useFactory: (repo: GroupRepository) => new CreateGroupUseCase(repo),
      inject: ["GroupRepository"],
    },
    {
      provide: GetUserGroupsUseCase,
      useFactory: (repo: GroupRepository) => new GetUserGroupsUseCase(repo),
      inject: ["GroupRepository"],
    },
    {
      provide: GetGroupDetailUseCase,
      useFactory: (repo: GroupRepository) => new GetGroupDetailUseCase(repo),
      inject: ["GroupRepository"],
    },
    {
      provide: GetGroupMembersUseCase,
      useFactory: (repo: GroupRepository) => new GetGroupMembersUseCase(repo),
      inject: ["GroupRepository"],
    },
    {
      provide: GenerateGroupInvitationUseCase,
      useFactory: (
        repo: GroupRepository,
        generator: InvitationTokenGenerator,
      ) => new GenerateGroupInvitationUseCase(repo, generator),
      inject: ["GroupRepository", "InvitationTokenGenerator"],
    },
    {
      provide: JoinGroupByInvitationUseCase,
      useFactory: (repo: GroupRepository) =>
        new JoinGroupByInvitationUseCase(repo),
      inject: ["GroupRepository"],
    },
    {
      provide: LeaveGroupUseCase,
      useFactory: (repo: GroupRepository) => new LeaveGroupUseCase(repo),
      inject: ["GroupRepository"],
    },
    {
      provide: RemoveGroupMemberUseCase,
      useFactory: (repo: GroupRepository) =>
        new RemoveGroupMemberUseCase(repo),
      inject: ["GroupRepository"],
    },
    {
      provide: UpdateGroupInfoUseCase,
      useFactory: (repo: GroupRepository) =>
        new UpdateGroupInfoUseCase(repo),
      inject: ["GroupRepository"],
    },
    {
      provide: TransferGroupAdminUseCase,
      useFactory: (repo: GroupRepository) =>
        new TransferGroupAdminUseCase(repo),
      inject: ["GroupRepository"],
    },
    {
      provide: AssignQuizToGroupUseCase,
      useFactory: (
        groupRepo: GroupRepository,
        quizReadService: QuizReadService,
      ) => new AssignQuizToGroupUseCase(groupRepo, quizReadService),
      inject: ["GroupRepository", "QuizReadService"],
    },
  ],
})
export class GroupsModule {}