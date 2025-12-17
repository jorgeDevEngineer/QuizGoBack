import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./DomainException";

export class DomainUnexpectedException extends DomainException {
    constructor(message?: string) {
      super(message || 'Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }  