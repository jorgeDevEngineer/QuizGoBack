import { 
    Controller, 
    Inject, 
    Post, 
    Get,
    Body, 
    Param,
    Headers, 
    UnauthorizedException, 
    HttpException,
    HttpStatus
} from "@nestjs/common";
import { CreateSessionRequestDto } from "../requestesDto/CreateSessionRequest.dto";
import { CreateSessionResponseDto } from "../../application/responseDtos/CreateSessionResponse.dto";
import { CreateSessionCommand } from "../../application/parameterObjects/CreateSessionCommand";
import { GetPinWithQrTokenResponseDto } from "../../application/responseDtos/GetPinWithQrTokenResponse.dto";
import { GetPinWithQrTokenQuery } from "../../application/parameterObjects/GetPinWithQrTokenQuery";
import { IHandler } from "src/lib/shared/IHandler";
import { ITokenProvider } from "src/lib/auth/application/providers/ITokenProvider";

@Controller('multiplayer-sessions')
export class MultiplayerSessionControler {

    constructor(
        @Inject('CreateSessionCommandHandler')
        private readonly CreateSessionHandler: IHandler<CreateSessionCommand, CreateSessionResponseDto>,

        @Inject('GetPinWithQrTokenQueryHandler')
        private readonly GetPinWithQrTokenHandler: IHandler<GetPinWithQrTokenQuery, GetPinWithQrTokenResponseDto>,

        @Inject("ITokenProvider") 
        private readonly tokenProvider: ITokenProvider
    ) {}

    @Post()
    async createSession(
        @Body() body: CreateSessionRequestDto,
        @Headers('authorization') authHeader?: string
    ):Promise<CreateSessionResponseDto>{
 
        try {
            const hostId = await this.getCurrentUserId(authHeader);
            return await this.CreateSessionHandler.execute({
                kahootId: body.kahootId,
                hostId: hostId
            });
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Get('qr-token/:qrToken')
    async getSessionPinWithQrToken(
        @Param('qrToken') qrToken: string
    ): Promise<GetPinWithQrTokenResponseDto> {
        try {
            return await this.GetPinWithQrTokenHandler.execute({
                qrToken: qrToken
            });
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    private async getCurrentUserId(authHeader: string): Promise<string> {
        const token = authHeader?.replace(/^Bearer\s+/i, "");
        if (!token) {
          throw new Error("Token required");
        }
        const payload = await this.tokenProvider.validateToken(token);
        if (!payload || !payload.sub) {
          throw new Error("Invalid token");
        }
        return payload.sub;
      }
    
}