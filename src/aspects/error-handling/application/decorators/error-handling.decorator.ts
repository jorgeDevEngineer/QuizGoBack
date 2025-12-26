
import { IUseCase } from '../../../../common/use-case.interface';
import { Result } from '../../../../common/domain/result';
import { ILoggerPort } from '../../../logger/domain/ports/logger.port';
import { DomainException } from '../../../../common/domain/domain.exception';

export class ErrorHandlingDecorator<TRequest, TResponse> implements IUseCase<TRequest, Result<TResponse>> {
  constructor(
    private readonly useCase: IUseCase<TRequest, Result<TResponse>>,
    private readonly logger: ILoggerPort,
    private readonly useCaseName: string,
  ) {}

  async execute(request: TRequest): Promise<Result<TResponse>> {
    try {
      // The Use Case is now expected to throw DomainException on validation errors
      return await this.useCase.execute(request);
    } catch (error: any) {
      if (error instanceof DomainException) {
        // Domain errors are predictable, so we log them as warnings.
        // The original error message is preserved as it is safe for the client.
        this.logger.warn(
          `Domain validation failed in ${this.useCaseName}: ${error.message} - Request: ${JSON.stringify(request)}`
        );
        return Result.fail<TResponse>(error.message);
      }

      // Unexpected errors are infrastructure or logic bugs.
      // These should be logged as critical errors, and the details must be hidden from the client.
      this.logger.error(
        `Unexpected technical error in ${this.useCaseName}. Request: ${JSON.stringify(request)}`,
        error.stack
      );
      return Result.fail<TResponse>('An unexpected technical error occurred.');
    }
  }
}
