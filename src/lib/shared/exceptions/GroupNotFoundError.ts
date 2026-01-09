import { HttpStatus } from "@nestjs/common";
import { DomainException } from "../exceptions/DomainException";  

export class GroupNotFoundError extends DomainException {
  constructor(groupId: string) {
    super(`Group with id ${groupId} not found`, HttpStatus.NOT_FOUND);
  }
}