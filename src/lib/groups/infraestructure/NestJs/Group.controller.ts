import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards
} from "@nestjs/common";
import { query, Request } from "express";

import { FakeCurrentUserGuard } from "./FakeCurrentUser.guard";

import { CreateGroupCommand } from "../../application/parameterObjects/CreateGroupCommand";
import { CreateGroupCommandHandler } from "../../application/Handlers/commands/CreateGroupCommandHandler";
import { UpdateGroupDetailsCommandHandler} from "../../application/Handlers/commands/UpdateGroupDetailsCommandHandler";
import { UpdateGroupDetailsCommand } from "../../application/parameterObjects/UpdateGroupDetailsCommand";
import { JoinGroupByInvitationCommand } from "../../application/parameterObjects/JoinGroupByInvitationCommand";
import { JoinGroupByInvitationCommandHandler } from "../../application/Handlers/commands/JoinGroupByInvitationCommandHandler";
import { GenerateGroupInvitationCommand } from "../../application/parameterObjects/GenerateGroupInvitationCommand";
import { GenerateGroupInvitationCommandHandler } from "../../application/Handlers/commands/GenerateGroupInvitationCommandHandler";
import { LeaveGroupCommand } from "../../application/parameterObjects/LeaveGroupCommand";
import { LeaveGroupCommandHandler } from "../../application/Handlers/commands/LeaveGroupCommandHandler";
import { RemoveGroupMemberCommand } from "../../application/parameterObjects/RemoveGroupMemberCommand";
import { RemoveGroupMemberCommandHandler } from "../../application/Handlers/commands/RemoveGroupMemberCommandHandler";
import { TransferGroupAdminCommand } from "../../application/parameterObjects/TransferGroupAdminCommand";
import { TransferGroupAdminCommandHandler } from "../../application/Handlers/commands/TransferGroupAdminCommandHandler";
import { AssignQuizToGroupCommand } from "../../application/parameterObjects/AssignQuizToGroupCommand";
import { AssignQuizToGroupCommandHandler } from "../../application/Handlers/commands/AssignQuizToGroupCommandHandler"; 
import { GetUserGroupsQuery } from "../../application/parameterObjects/GetUserGroupsQuery";
import { GetUserGroupsQueryHandler } from "../../application/Handlers/queries/GetUserGroupsQueryHandler";
import { GetGroupMembersQuery } from "../../application/parameterObjects/GetGroupMembersQuery";
import { GetGroupMembersQueryHandler } from "../../application/Handlers/queries/GetGroupMembersQueryHandler";
import { GetGroupDetailsQuery } from "../../application/parameterObjects/GetGroupDetailsQuery";
import { GetGroupDetailsQueryHandler } from "../../application/Handlers/queries/GetGroupDetailsQueryHandler";
import { GetGroupQuizzesQuery } from "../../application/parameterObjects/GetGroupQuizzesQuery";
import { GetGroupQuizzesQueryHandler } from "../../application/Handlers/queries/GetGroupQuizzesQueryHandler";
import { GetGroupLeaderboardQuery } from "../../application/parameterObjects/GetGroupLeaderboardQuery";
import { GetGroupLeaderboardQueryHandler } from "../../application/Handlers/queries/GetGroupLeaderboardQUeryHandler";
import { GetGroupQuizLeaderboardQuery } from "../../application/parameterObjects/GetGroupQuizLeaderboarquery";
import { GetGroupQuizLeaderboardQueryHandler } from "../../application/Handlers/queries/GetGroupQuizLeaderboardQueryHandler";

import { CreateGroupRequestDto } from "../../application/dtos/GroupRequest.dto";
import { CreateGroupResponseDto } from "../../application/dtos/GroupResponse.dto";

import { AssignQuizToGroupRequestDto } from "../../application/dtos/GroupRequest.dto";
import { AssignQuizToGroupResponseDto } from "../../application/dtos/GroupResponse.dto";




@Controller("groups")
@UseGuards(FakeCurrentUserGuard)
export class GroupsController {
  constructor(
    private readonly createGroupHandler: CreateGroupCommandHandler,
    private readonly updateGroupDetailsHandler: UpdateGroupDetailsCommandHandler,
    private readonly joinGroupByInvitationHandler: JoinGroupByInvitationCommandHandler,
    private readonly generateGroupInvitationHandler: GenerateGroupInvitationCommandHandler,
    private readonly leaveGroupCommandHandler: LeaveGroupCommandHandler,
    private readonly removeGroupMemberCommandHandler: RemoveGroupMemberCommandHandler,
    private readonly transferGroupAdminCommandHandler: TransferGroupAdminCommandHandler,
    private readonly assignQuizToGroupCommandHandler: AssignQuizToGroupCommandHandler,
    private readonly getUserGroupsQueryHandler: GetUserGroupsQueryHandler,
    private readonly getGroupMembersQueryHandler: GetGroupMembersQueryHandler,
    private readonly getGroupDetailsQueryHandler: GetGroupDetailsQueryHandler,
    private readonly getGroupAssignedQuizzesQueryHandler: GetGroupQuizzesQueryHandler,
    private readonly getGroupLeaderboardQueryHandler: GetGroupLeaderboardQueryHandler,
    private readonly getGroupQuizLeaderboardQueryHandler: GetGroupQuizLeaderboardQueryHandler,
  ) {}

  private getCurrentUserId(req: Request): string {
    const user = (req as any).user;
    if (!user?.id) {
      throw new Error("Missing current user id in request.user");
    }
    return user.id;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createGroup(
    @Body() body: CreateGroupRequestDto,
    @Req() req: Request,
  ): Promise<CreateGroupResponseDto> {  
    const currentUserId = this.getCurrentUserId(req);
    const command = new CreateGroupCommand(body.name, currentUserId);

    return this.createGroupHandler.execute(command);
}


  @Post(":groupId/quizzes")
  @HttpCode(HttpStatus.CREATED)
  async assignQuizToGroup(
    @Param("groupId") groupId: string,
    @Body() body: AssignQuizToGroupRequestDto,
    @Req() req: Request,
  ): Promise<AssignQuizToGroupResponseDto> {
    const currentUserId = this.getCurrentUserId(req);

    if (!body.availableUntil) {
      throw new Error("es necesario proporcionar availableUntil");
    }
    const availableUntil = new Date(body.availableUntil);
    const command = new AssignQuizToGroupCommand(
      groupId,
      body.quizId,
      currentUserId,
      availableUntil,
    );
    const result = await this.assignQuizToGroupCommandHandler.execute(command);
    if (result.isLeft()) {
      throw result.getLeft();
    }
    return result.getRight();
}

@Get(':groupId/quizzes')
async getAssignedQuizzes(
  @Param('groupId') groupId: string,
  @Req() req: any,
) {
  const currentUserId = this.getCurrentUserId(req);
  const query = new GetGroupQuizzesQuery(groupId, currentUserId);
  const result = await this.getGroupAssignedQuizzesQueryHandler.execute(query);
  if (result.isLeft()) {
    throw result.getLeft();
  }
  return result.getRight();
}

  @Get()
  async getMyGroups(@Req() req: Request) {
    const currentUserId = this.getCurrentUserId(req);
    const query = new GetUserGroupsQuery(currentUserId);
    const result = await this.getUserGroupsQueryHandler.execute(query);
    if (result.isLeft()) {
      throw result.getLeft();
    }
    return result.getRight();
  }

  @Get(":id")
  async getGroupDetail(@Param("id") id: string, @Req() req: Request) {
    const currentUserId = this.getCurrentUserId(req);
    const query = new GetGroupDetailsQuery(id, currentUserId);

    const result = await this.getGroupDetailsQueryHandler.execute(query);
    if (result.isLeft()) {
      throw result.getLeft();
    }
    return result.getRight();
  }


  @Get(":id/members")
  async getGroupmembers(@Param("id") id: string, @Req() req: Request) {
    const currentUserId = this.getCurrentUserId(req);
    const query = new GetGroupMembersQuery(id, currentUserId);
    const result = await this.getGroupMembersQueryHandler.execute(query);
    if (result.isLeft()) {
      throw result.getLeft();
    }
    return result.getRight();
  }

  @Post(":id/invitation")
  async generateInvitation(@Param("id") id: string, @Req() req: Request) {
    const currentUserId = this.getCurrentUserId(req);
    const command = new GenerateGroupInvitationCommand(
      id,
      currentUserId,
    );
    const result = await this.generateGroupInvitationHandler.execute(command);
    if (result.isLeft()) {
      throw result.getLeft();
    }
    return result.getRight();
  }

  @Post("join")
  async joinByInvitation(
    @Body() body: { token: string },
    @Req() req: Request,
  ) {
    const currentUserId = this.getCurrentUserId(req);
    const command = new JoinGroupByInvitationCommand(
      body.token,
      currentUserId,
    );
    const result = await this.joinGroupByInvitationHandler.execute(command);
    if (result.isLeft()) {
      throw result.getLeft();
    }
    return result.getRight();
  }


  @Post(":id/leave")
  async leaveGroup(@Param("id") id: string, @Req() req: Request) {
    const currentUserId = this.getCurrentUserId(req);
    const command = new LeaveGroupCommand(
      id,
      currentUserId,
    );
    const result = await this.leaveGroupCommandHandler.execute(command);
    if (result.isLeft()) {
      throw result.getLeft();
    }
    return result.getRight();
  }


  @Delete(":id/members/:memberId")
  async removeMember(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
    @Req() req: Request,
  ) {
    const currentUserId = this.getCurrentUserId(req);
    const command = new RemoveGroupMemberCommand(
      id,
      memberId,
      currentUserId,
    );
    const result = await this.removeGroupMemberCommandHandler.execute(command);
    if (result.isLeft()) {
      throw result.getLeft();
    }
    return result.getRight();
  }


  @Patch(":id")
  async updateGroupInfo(
    @Param("id") id: string,
    @Body() body: { name?: string; description?: string },
    @Req() req: Request,
  ) {
    const currentUserId = this.getCurrentUserId(req);
    const command = new UpdateGroupDetailsCommand(
      id,
      currentUserId,
      body.name,
      body.description,
    );
    const result = await this.updateGroupDetailsHandler.execute(command);
    if (result.isLeft()) {
      throw result.getLeft();
    }
    return result.getRight();
  }


  @Post(":id/transfer-admin")
  async transferAdmin(
    @Param("id") id: string,
    @Body() body: { newAdminUserId: string },
    @Req() req: Request,
  ) {
    const currentUserId = this.getCurrentUserId(req);
    const command = new TransferGroupAdminCommand(
      id,
      currentUserId,
      body.newAdminUserId,
    );
    const result = await this.transferGroupAdminCommandHandler.execute(command);
    if (result.isLeft()) {
      throw result.getLeft();
    }
    return result.getRight();
  }

  @Get(':groupId/leaderboard')
async getGroupLeaderboard(
  @Param('groupId') groupId: string,
  @Req() req: Request,
) {
  const userId = this.getCurrentUserId(req);
  const query = new GetGroupLeaderboardQuery(groupId, userId);
  const result = await this.getGroupLeaderboardQueryHandler.execute(query);
  if (result.isLeft()) {
    throw result.getLeft();
  }
  return result.getRight();
}

@Get(":groupId/quizzes/:quizId/leaderboard")
async getGroupQuizLeaderboard(
  @Param("groupId") groupId: string,
  @Param("quizId") quizId: string,
  @Req() req: Request,
) {
  const userId = this.getCurrentUserId(req);
  const query = new GetGroupQuizLeaderboardQuery(
    groupId,
    quizId,
    userId,
  );
  return await this.getGroupQuizLeaderboardQueryHandler.execute(query
  );
}

}

