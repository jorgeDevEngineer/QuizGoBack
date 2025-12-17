import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./DomainException";

export class UserNotFoundException extends DomainException {
    constructor(message?: string) {
      super(message || 'No se ha encontrado al usuario', HttpStatus.NOT_FOUND);
    }
  }