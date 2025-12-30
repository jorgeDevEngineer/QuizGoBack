import { DomainException } from "src/lib/shared/exceptions/DomainException";
import { DomainUnexpectedException } from "src/lib/shared/exceptions/DomainUnexpectedException";
import { Either } from "src/lib/shared/Type Helpers/Either";
import { BaseErrorHandlingDecorator } from "./baseErrorHandling.decorator";

export class ErrorHandlingDecoratorWithEither<TParameterObject, TResponse>
  extends BaseErrorHandlingDecorator<TParameterObject, Either<DomainException, TResponse>> {

  protected handleException(
    error: Error,
    command: TParameterObject
  ): Either<DomainException, TResponse> {
    this.logger.error(
      `Unexpected technical error in ${this.handlerName}. Command: ${JSON.stringify(command)}`,
      error.stack
    );
    // 🔹 Siempre devolvemos la excepción base de dominio para lo inesperado
    return Either.makeLeft(new DomainUnexpectedException());
  }
}