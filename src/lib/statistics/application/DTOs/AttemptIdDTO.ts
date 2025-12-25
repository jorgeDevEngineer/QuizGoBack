import { IsNotEmpty, IsUUID } from "class-validator";
import { SinglePlayerGameId} from "../../../singlePlayerGame/domain/valueObjects/SinglePlayerGameVOs";

export class AttemptIdDTO {
    constructor(attemptId: string) {
      this.attemptId = attemptId;
    }
    @IsUUID()
    @IsNotEmpty()
    attemptId!: string;
  }