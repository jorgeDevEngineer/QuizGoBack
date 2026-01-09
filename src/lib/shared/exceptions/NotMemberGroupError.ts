import { HttpStatus } from "@nestjs/common";
import { DomainException } from "../exceptions/DomainException";

export class UserNotMemberOfGroupError extends DomainException {
  constructor(userId: string, groupId: string) {
    super(`User ${userId} is not a member of group ${groupId}`, HttpStatus.FORBIDDEN);
  }
}
