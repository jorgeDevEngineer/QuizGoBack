import { IsString, MaxLength, MinLength } from "class-validator";

export class PlayerJoinDto {

    @MinLength(4)
    @MaxLength(20)
    @IsString()
    nickname: string;

}