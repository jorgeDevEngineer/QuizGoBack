import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./DomainException";

export class NotOwnerException extends DomainException {
  constructor() {
    super("El usuario no es el creador de este quiz", HttpStatus.FORBIDDEN);
  }
}
