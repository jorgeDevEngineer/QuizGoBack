import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./DomainException";

export class UserFavoriteQuizNotFoundException extends DomainException {
    constructor() {
      super('El favorito no existe', HttpStatus.NOT_FOUND);
    }
  }
  