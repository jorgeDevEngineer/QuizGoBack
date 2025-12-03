import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./DomainException";

export class QuizAlreadyFavoriteException extends DomainException {
    constructor() {
      super('El quiz ya está marcado como favorito', HttpStatus.CONFLICT);
    }
  }