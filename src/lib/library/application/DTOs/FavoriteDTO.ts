import { IsNotEmpty, IsUUID } from "class-validator";
import { UserId } from "../../domain/valueObject/Quiz";

export class FavoriteDTO {
    @IsUUID()
    @IsNotEmpty()
    userId!: string;
  
    public toValueObject(): UserId {
      return UserId.of(this.userId);
    }
  }
  
  