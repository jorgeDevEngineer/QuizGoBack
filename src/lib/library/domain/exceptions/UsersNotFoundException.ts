import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./DomainException";

export class UsersNotFoundException extends DomainException {
    constructor() {
      super('No se ha encontrado usuarios', HttpStatus.NOT_FOUND);
    }
  }