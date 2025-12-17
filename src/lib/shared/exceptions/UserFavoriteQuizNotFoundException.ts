import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./DomainException";

export class UserFavoriteQuizNotFoundException extends DomainException {
    constructor(message?: string) {
      super(message || 'Este quiz no está marcado como favorito', HttpStatus.NOT_FOUND);
    }
  }
  