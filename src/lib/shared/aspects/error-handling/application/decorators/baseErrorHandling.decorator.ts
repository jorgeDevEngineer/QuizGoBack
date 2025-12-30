import { IHandler } from "src/lib/shared/IHandler";
import { ILoggerPort } from "../../../logger/domain/ports/logger.port";

export abstract class BaseErrorHandlingDecorator<TParameterObject, TResponse>
  implements IHandler<TParameterObject, TResponse> {

  constructor(
    protected readonly handler: IHandler<TParameterObject, TResponse>,
    protected readonly logger: ILoggerPort,
    protected readonly handlerName: string,
  ) {}

  async execute(command: TParameterObject): Promise<TResponse> {
    try {
      return await this.handler.execute(command);
    } catch (error: any) {
      // 🔹 Solo atrapamos excepciones inesperadas
      return this.handleException(error, command);
    }
  }

  // Un único método abstracto para manejar excepciones inesperadas
  protected abstract handleException(error: Error, command: TParameterObject): TResponse;
}