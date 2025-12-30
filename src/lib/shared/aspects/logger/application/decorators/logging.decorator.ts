import { ILoggerPort } from '../../domain/ports/logger.port';
import { IHandler } from 'src/lib/shared/IHandler';

export class LoggingUseCaseDecorator<TRequest, TResponse> implements IHandler<TRequest, TResponse> {
  constructor(
    private readonly useCase: IHandler<TRequest, TResponse>,
    private readonly logger: ILoggerPort,
    private readonly context: string,
  ) {}

  async execute(request?: TRequest): Promise<TResponse> {
    this.logger.log(`[${this.context}] - Starting execution`);
    try {
      const result = await this.useCase.execute(request);
      this.logger.log(`[${this.context}] - Execution finished successfully`);
      return result;
    } catch (error) {
      this.logger.error(`[${this.context}] - Execution failed`, error.stack);
      throw error;
    }
  }
}
