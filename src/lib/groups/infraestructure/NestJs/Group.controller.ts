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
import { Request } from "express";

import { FakeCurrentUserGuard } from "./FakeCurrentUser.guard";

import { CreateGroupUseCase } from "../../application/CrearteGroupUseCase";
import { GetUserGroupsUseCase } from "../../application/GetUserGroupsUseCase";
import { GetGroupDetailUseCase } from "../../application/GroupDetailsUseCase";
import { GenerateGroupInvitationUseCase } from "../../application/GenerateGroupInvitationUseCase";
import { GetGroupMembersUseCase } from "../../application/GetGroupMembers";

import { CreateGroupRequestDto } from "../../application/CrearteGroupUseCase";
import { CreateGroupResponseDto } from "../../application/CrearteGroupUseCase";
import { JoinGroupByInvitationUseCase } from "../../application/JoinGroupByInvitation";
import { RemoveGroupMemberUseCase } from "../../application/RemoveGroupMemberUseCase";
import { UpdateGroupInfoUseCase } from "../../application/UpdateGroupDetailsUseCase";
import { LeaveGroupUseCase } from "../../application/LeaveGroupUseCase";
import { TransferGroupAdminUseCase } from "../../application/TransferGroupAdminUseCase";
import { AssignQuizToGroupRequestDto } from "../../application/AssignQuizToGroupUseCase"
import { AssignQuizToGroupResponseDto } from "../../application/AssignQuizToGroupUseCase"
import { AssignQuizToGroupUseCase } from "../../application/AssignQuizToGroupUseCase";


@Controller("groups")
@UseGuards(FakeCurrentUserGuard)
export class GroupsController {
  constructor(
    private readonly createGroupUseCase: CreateGroupUseCase,
    private readonly getUserGroupsUseCase: GetUserGroupsUseCase,
    private readonly getGroupDetailUseCase: GetGroupDetailUseCase,
    private readonly generateGroupInvitationUseCase: GenerateGroupInvitationUseCase,
    private readonly joinGroupByInvitationUseCase: JoinGroupByInvitationUseCase,
    private readonly leaveGroupUseCase: LeaveGroupUseCase,
    private readonly removeGroupMemberUseCase: RemoveGroupMemberUseCase,
    private readonly updateGroupInfoUseCase: UpdateGroupInfoUseCase,
    private readonly transferGroupAdminUseCase: TransferGroupAdminUseCase,
    private readonly getGroupMembersUseCase: GetGroupMembersUseCase,
    private readonly assignQuizToGroupUseCase: AssignQuizToGroupUseCase,
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

    const result = await this.createGroupUseCase.execute({
      name: body.name,
      currentUserId,
    });

    return result;
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
    return this.assignQuizToGroupUseCase.execute({
      groupId,
      quizId: body.quizId,
      currentUserId,
      availableUntil,
    });
}

  @Get()
  async getMyGroups(@Req() req: Request) {
    const currentUserId = this.getCurrentUserId(req);

    return this.getUserGroupsUseCase.execute({ currentUserId });
  }

  @Get(":id")
  async getGroupDetail(@Param("id") id: string, @Req() req: Request) {
    const currentUserId = this.getCurrentUserId(req);

    return this.getGroupDetailUseCase.execute({
      groupId: id,
      currentUserId,
    });
  }
  @Get(":id/members")
  async getGroupmembers(@Param("id") id: string, @Req() req: Request) {
    const currentUserId = this.getCurrentUserId(req);

    return this.getGroupMembersUseCase.execute({
      groupId: id,
      currentUserId,
    });
  }

  @Post(":id/invitation")
  async generateInvitation(@Param("id") id: string, @Req() req: Request) {
    const currentUserId = this.getCurrentUserId(req);

    return this.generateGroupInvitationUseCase.execute({
      groupId: id,
      currentUserId,
    });
  }

  @Post("join")
  async joinByInvitation(
    @Body() body: { token: string },
    @Req() req: Request,
  ) {
    const currentUserId = this.getCurrentUserId(req);

    return this.joinGroupByInvitationUseCase.execute({
      token: body.token,
      currentUserId,
    });
  }
  @Post(":id/leave")
  async leaveGroup(@Param("id") id: string, @Req() req: Request) {
    const currentUserId = this.getCurrentUserId(req);

    return this.leaveGroupUseCase.execute({
      groupId: id,
      currentUserId,
    });
  }
  @Delete(":id/members/:memberId")
  async removeMember(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
    @Req() req: Request,
  ) {
    const currentUserId = this.getCurrentUserId(req);

    return this.removeGroupMemberUseCase.execute({
      groupId: id,
      targetUserId: memberId,
      currentUserId,
    });
  }
  @Patch(":id")
  async updateGroupInfo(
    @Param("id") id: string,
    @Body() body: { name?: string; description?: string },
    @Req() req: Request,
  ) {
    const currentUserId = this.getCurrentUserId(req);

    return this.updateGroupInfoUseCase.execute({
      groupId: id,
      currentUserId,
      name: body.name,
      description: body.description,
    });
  }
  @Post(":id/transfer-admin")
  async transferAdmin(
    @Param("id") id: string,
    @Body() body: { newAdminUserId: string },
    @Req() req: Request,
  ) {
    const currentUserId = this.getCurrentUserId(req);

    return this.transferGroupAdminUseCase.execute({
    groupId: id,
    currentUserId,
    newAdminUserId: body.newAdminUserId,
  });
  
}

}