import { MultiplayerSessionId } from "src/lib/shared/domain/ids";
import { UserId } from "src/lib/user/domain/valueObject/UserId";

export class GetSessionReport {
  constructor(
    public readonly sessionId: MultiplayerSessionId,
    public readonly ownerId: UserId
  ) {}
}
