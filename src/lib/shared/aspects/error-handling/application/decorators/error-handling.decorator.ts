import { Result } from "../../../../Type Helpers/result";
import { DomainException } from "../../../../exceptions/domain.exception";
import { BaseErrorHandlingDecorator } from "./baseErrorHandling.decorator";

export class ErrorHandlingDecorator<
  TParameterObject,
  TResponse,
> extends BaseErrorHandlingDecorator<TParameterObject, Result<TResponse>> {
  protected handleException(
    error: Error,
    command: TParameterObject
  ): Result<TResponse> {
    console.log("entra al decorator");
    console.log(typeof error);
    if (error instanceof DomainException) {
      // Errores de dominio → log como warning y devolvemos Result.fail con el error
      this.logger.warn(
        `Domain validation failed in ${this.handlerName}: ${error.message} - Command: ${JSON.stringify(command)}`
      );
      return Result.fail<TResponse>(error);
    }

    // Errores inesperados → log como error crítico y devolvemos mensaje genérico
    this.logger.error(
      `Unexpected technical error in ${this.handlerName}. Command: ${JSON.stringify(command)}`,
      error.stack
    );
    return Result.fail<TResponse>(
      new Error("An unexpected technical error occurred")
    );
  }
}
