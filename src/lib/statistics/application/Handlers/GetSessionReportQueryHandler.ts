import { GetSessionReportDomainService } from "../../domain/services/GetSessionReportDomainService";
import { IHandler } from "src/lib/shared/IHandler";
import { GetSessionReport } from "../Parameter Objects/GetSessionReport";
import {
  SessionReportResponse,
  toSessionReportResponse,
} from "../Response Types/SessionReportResponse";
import { DomainException } from "src/lib/shared/exceptions/DomainException";
import { DomainUnexpectedException } from "src/lib/shared/exceptions/DomainUnexpectedException";
import { Either } from "src/lib/shared/Type Helpers/Either";

export class GetSessionReportQueryHandler
  implements
    IHandler<GetSessionReport, Either<DomainException, SessionReportResponse>>
{
  constructor(
    private getSessionReportDomainService: GetSessionReportDomainService
  ) {}

  async execute(
    command: GetSessionReport
  ): Promise<Either<DomainException, SessionReportResponse>> {
    const sessionId = command.sessionId;
    const ownerId = command.ownerId;

    try {
      const data = await this.getSessionReportDomainService.execute(
        sessionId,
        ownerId
      );
      if (data.isLeft()) {
        return Either.makeLeft(data.getLeft());
      }
      const [session, quiz] = data.getRight();
      const result = toSessionReportResponse(session, quiz);
      return Either.makeRight(result);
    } catch (error) {
      return Either.makeLeft(new DomainUnexpectedException(error.message));
    }
  }
}
