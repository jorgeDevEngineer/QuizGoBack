import { randomUUID } from "node:crypto";

import { GroupRepository } from "../domain/port/GroupRepository";
import { GroupId } from "../domain/valueObject/GroupId";
import { GroupQuizAssignment } from "../domain/entity/GroupQuizAssigment";
import { GroupQuizAssignmentId } from "../domain/valueObject/GroupQuizAssigmentId";

import { QuizId, UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { GroupNotFoundError } from "../domain/GroupNotFoundError";
import { UserNotMemberOfGroupError } from "../domain/NotMemberGroupError";
import { QuizReadService } from "../domain/port/QuizReadService";

export class AssignQuizToGroupRequestDto {
  quizId!: string;
  availableUntil!: string; 
}

export class AssignQuizToGroupResponseDto {
  id!: string;
  groupId!: string;
  quizId!: string;
  assignedBy!: string;
  createdAt!: string;
  availableFrom!: string; 
  availableUntil!: string; 
  isActive!: boolean;
}


export interface AssignQuizToGroupInput {
  groupId: string;
  quizId: string;
  currentUserId: string;
  availableUntil: Date;   
  now?: Date;
}

export interface AssignQuizToGroupOutput {
  id: string;
  groupId: string;
  quizId: string;
  assignedBy: string;
  createdAt: string;
  availableFrom: string;
  availableUntil: string;
  isActive: boolean;
}

export class AssignQuizToGroupUseCase {
  constructor(private readonly groupRepository: GroupRepository, private readonly quizReadService: QuizReadService,
) {}

  async execute(input: AssignQuizToGroupInput): Promise<AssignQuizToGroupOutput> {
    const now = input.now ?? new Date();
    const availableFrom = now;

    const availableUntil = input.availableUntil;
    if (!availableUntil) {
      throw new Error("availableUntil is required");
    }
    const groupId = GroupId.of(input.groupId);
    const quizId = QuizId.of(input.quizId);
    const userId = UserId.of(input.currentUserId);

    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new GroupNotFoundError(input.groupId);
    }

    const isMember = group.members.some(
      (m) => m.userId.value === userId.value,
    );
    if (!isMember) {
      throw new UserNotMemberOfGroupError(input.currentUserId, input.groupId);
    }
    
    const canUseQuiz = await this.quizReadService.quizBelongsToUser(
      quizId,
      userId,
    );
    if (!canUseQuiz) {
      throw new Error('El quiz no existe o no pertenece al usuario');
    }

    const assignment = GroupQuizAssignment.create(
      GroupQuizAssignmentId.of(randomUUID()),
      quizId,
      userId,
      availableFrom,
      availableUntil,
      now,
    );

    group.assignQuiz(assignment, now);

    await this.groupRepository.save(group);

    return {
      id: assignment.id.value,
      groupId: group.id.value,
      quizId: assignment.quizId.value,
      assignedBy: assignment.assignedBy.value,
      createdAt: assignment.createdAt.toISOString(),
      availableFrom: assignment.availableFrom.toISOString(),  
      availableUntil: assignment.availableUntil.toISOString(),
      isActive: assignment.isActive,
    };
  }
}