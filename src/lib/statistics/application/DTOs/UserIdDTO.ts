import { IsNotEmpty, IsUUID } from "class-validator";
import { UserId } from "../../../kahoot/domain/valueObject/Quiz";

export class UserIdDTO {
    @IsUUID()
    @IsNotEmpty()
    userId!: string;
  }