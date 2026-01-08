import { IsNotEmpty, IsUUID } from "class-validator";
import { SinglePlayerGameId } from "src/lib/shared/domain/ids";

export class AttemptIdDTO {
    constructor(attemptId: string) {
      this.attemptId = attemptId;
    }
    @IsUUID()
    @IsNotEmpty()
    attemptId!: string;
  }