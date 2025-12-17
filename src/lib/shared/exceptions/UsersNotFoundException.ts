import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./DomainException";

export class UsersNotFoundException extends DomainException {
    constructor(message?: string) {
      super(message || 'No se han encontrado usuarios', HttpStatus.NOT_FOUND);
    }
  }