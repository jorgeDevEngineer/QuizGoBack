import { IHandler } from 'src/lib/shared/IHandler';

export class AuthorizationDecorator<TRequest extends { requesterUserId?: string; targetUserId: string }, TResponse> implements IHandler<TRequest, TResponse> {
  constructor(
    private readonly useCase: IHandler<TRequest, TResponse>,
  ) {}

  async execute(request: TRequest): Promise<TResponse> {
    if (request.requesterUserId && request.requesterUserId !== request.targetUserId) {
      throw new Error('Unauthorized: You can only perform operations on your own account');
    }
    return this.useCase.execute(request);
  }
}