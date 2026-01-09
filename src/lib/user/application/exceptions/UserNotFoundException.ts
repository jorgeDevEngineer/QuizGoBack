import { DomainException } from "src/lib/shared/exceptions/domain.exception";

export class UserNotFoundException extends DomainException {
  constructor(message?: string) {
    super(message || "No se ha encontrado al usuario");
  }
}
