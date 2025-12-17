import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./DomainException";

export class NotInProgressQuizzesException extends DomainException {
    constructor(message?: string) {
      super(message || 'No se tienen quices en progreso actualmente', HttpStatus.NOT_FOUND);
    }
  }