import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./DomainException";

export class GameNotFoundException extends DomainException {
    constructor(message?: string) {
      super(message || 'El juego no existe', HttpStatus.NOT_FOUND);
    }
  }