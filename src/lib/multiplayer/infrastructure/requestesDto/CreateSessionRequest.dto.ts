import { IsUUID } from "class-validator";

export class CreateSessionRequestDto {

    @IsUUID()
    kahootId: string
    
}