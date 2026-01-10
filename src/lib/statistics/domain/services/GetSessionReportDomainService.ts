import { IHandler } from "src/lib/shared/IHandler";
import { MultiplayerSessionHistoryRepository } from "../port/MultiplayerSessionHistoryRepository";
import { MultiplayerSessionId } from "src/lib/shared/domain/ids";
import { Either } from "src/lib/shared/Type Helpers/Either";
import { DomainException } from "src/lib/shared/exceptions/DomainException";
import { MultiplayerSession } from "src/lib/multiplayer/domain/aggregates/MultiplayerSession";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { NotOwnerException } from "src/lib/shared/exceptions/NotOwnerException";
import { DomainUnexpectedException } from "src/lib/shared/exceptions/DomainUnexpectedException";
import { SessionNotFoundException } from "src/lib/shared/exceptions/SessionNotFound";
import { QuizRepository } from "src/lib/kahoot/domain/port/QuizRepository";
import { Quiz } from "src/lib/kahoot/domain/entity/Quiz";

export class GetSessionReportDomainService {
  constructor(
    private readonly sessionRepository: MultiplayerSessionHistoryRepository,
    private readonly quizRepository: QuizRepository
  ) {}

  async execute(
    sessionId: MultiplayerSessionId,
    ownerId: UserId
  ): Promise<
    Either<DomainException, [session: MultiplayerSession, quiz: Quiz]>
  > {
    const session = await this.sessionRepository.findbyId(sessionId);
    if (!session) {
      return Either.makeLeft(new SessionNotFoundException());
    }

    if (session.getHostId().getValue() !== ownerId.value) {
      return Either.makeLeft(new NotOwnerException());
    }

    const quiz = await this.quizRepository.find(session.getQuizId());

    if (!quiz) {
      Either.makeLeft(
        new DomainUnexpectedException("Ha ocurrido un error inesperado")
      );
    }

    return Either.makeRight([session, quiz]);
  }
}
