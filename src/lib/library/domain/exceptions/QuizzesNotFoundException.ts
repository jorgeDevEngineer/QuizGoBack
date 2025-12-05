import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./DomainException";

export class QuizzesNotFoundException extends DomainException {
    constructor() {
      super('No se han encontrado los quices', HttpStatus.NOT_FOUND);
    }
  }