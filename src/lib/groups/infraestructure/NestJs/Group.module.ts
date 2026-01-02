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

import { CreateGroupCommandHandler } from "../../application/Handlers/commands/CreateGroupCommandHandler";
import { UpdateGroupDetailsCommandHandler} from "../../application/Handlers/commands/UpdateGroupDetailsCommandHandler";
import { JoinGroupByInvitationCommandHandler } from "../../application/Handlers/commands/JoinGroupByInvitationCommandHandler";
import { GenerateGroupInvitationCommandHandler } from "../../application/Handlers/commands/GenerateGroupInvitationCommandHandler";
import { LeaveGroupCommandHandler } from "../../application/Handlers/commands/LeaveGroupCommandHandler";
import { RemoveGroupMemberCommandHandler } from "../../application/Handlers/commands/RemoveGroupMemberCommandHandler";
import { TransferGroupAdminCommandHandler } from "../../application/Handlers/commands/TransferGroupAdminCommandHandler";
import { AssignQuizToGroupCommandHandler } from "../../application/Handlers/commands/AssignQuizToGroupCommandHandler";
import { GetUserGroupsQueryHandler } from "../../application/Handlers/commands/GetUserGroupsQueryHandler";
import { GetGroupMembersQueryHandler } from "../../application/Handlers/commands/GetGroupMembersQueryHandler";
import { GetGroupDetailsQueryHandler } from "../../application/Handlers/commands/GetGroupDetailsQueryHandler";

import { TypeOrmQuizEntity } from "../../../kahoot/infrastructure/TypeOrm/TypeOrmQuizEntity";
import { TypeOrmQuizReadService } from "../TypeOrm/QuizReadServiceImplementation";
import { QuizReadService } from "../../domain/port/QuizReadService";
import { create } from "domain";

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
      provide: CreateGroupCommandHandler,
      useFactory: (repo: GroupRepository) => new CreateGroupCommandHandler(repo),
      inject: ["GroupRepository"],
    },
    {
      provide: GetUserGroupsQueryHandler,
      useFactory: (repo: GroupRepository) => new GetUserGroupsQueryHandler(repo),
      inject: ["GroupRepository"],
    },
    {
      provide: GetGroupDetailsQueryHandler,
      useFactory: (repo: GroupRepository) => new GetGroupDetailsQueryHandler(repo),
      inject: ["GroupRepository"],
    },
    {
      provide: GetGroupMembersQueryHandler,
      useFactory: (repo: GroupRepository) => new GetGroupMembersQueryHandler(repo),
      inject: ["GroupRepository"],
    },
    {
      provide: GenerateGroupInvitationCommandHandler,
      useFactory: (
        repo: GroupRepository,
        generator: InvitationTokenGenerator,
      ) => new GenerateGroupInvitationCommandHandler(repo, generator),
      inject: ["GroupRepository", "InvitationTokenGenerator"],
    },
    {
      provide: JoinGroupByInvitationCommandHandler,
      useFactory: (repo: GroupRepository) =>
        new JoinGroupByInvitationCommandHandler(repo),
      inject: ["GroupRepository"],
    },
    {
      provide: LeaveGroupCommandHandler,
      useFactory: (repo: GroupRepository) => new LeaveGroupCommandHandler(repo),
      inject: ["GroupRepository"],
    },
    {
      provide: RemoveGroupMemberCommandHandler,
      useFactory: (repo: GroupRepository) =>
        new RemoveGroupMemberCommandHandler(repo),
      inject: ["GroupRepository"],
    },
    {
      provide: UpdateGroupDetailsCommandHandler,
      useFactory: (repo: GroupRepository) =>
        new UpdateGroupDetailsCommandHandler(repo),
      inject: ["GroupRepository"],
    },
    {
      provide: TransferGroupAdminCommandHandler,
      useFactory: (repo: GroupRepository) =>
        new TransferGroupAdminCommandHandler(repo),
      inject: ["GroupRepository"],
    },
    {
      provide: AssignQuizToGroupCommandHandler,
      useFactory: (
        groupRepo: GroupRepository,
        quizReadService: QuizReadService,
      ) => new AssignQuizToGroupCommandHandler(groupRepo, quizReadService),
      inject: ["GroupRepository", "QuizReadService"],
    },
  ],
})
export class GroupsModule {}