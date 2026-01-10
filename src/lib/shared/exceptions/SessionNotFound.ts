import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./DomainException";

export class SessionNotFoundException extends DomainException {
  constructor() {
    super("La partida multijugadir no existe", HttpStatus.NOT_FOUND);
  }
}
