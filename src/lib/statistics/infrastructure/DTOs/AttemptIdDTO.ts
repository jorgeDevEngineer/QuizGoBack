import { IsNotEmpty, IsUUID } from "class-validator";

export class AttemptIdDTO {
  constructor(attemptId: string) {
    this.attemptId = attemptId;
  }
  @IsUUID()
  @IsNotEmpty()
  attemptId!: string;
}

export class SessionIdDTO {
  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }
  @IsUUID()
  @IsNotEmpty()
  sessionId!: string;
}
