import { HttpStatus } from "@nestjs/common";
import { DomainException } from "../exceptions/DomainException";

export class GroupBusinessException extends DomainException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}