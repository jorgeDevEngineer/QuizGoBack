import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./DomainException";

export class QuizNotFoundException extends DomainException {
    constructor() {
      super('El quiz no existe', HttpStatus.NOT_FOUND);
    }
  }