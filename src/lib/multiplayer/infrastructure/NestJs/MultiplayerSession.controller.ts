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

@Controller('multiplayer-sessions')
export class MultiplayerSessionControler {

    constructor(
        @Inject('CreateSessionCommandHandler')
        private readonly CreateSessionHandler: IHandler<CreateSessionCommand, CreateSessionResponseDto>,

        @Inject('GetPinWithQrTokenQueryHandler')
        private readonly GetPinWithQrTokenHandler: IHandler<GetPinWithQrTokenQuery, GetPinWithQrTokenResponseDto>
    ) {}

    //Mientras no esté hecho el modulo de autentición
    private extractUserIdFromToken(authHeader: string): string {
        // Implementación simple - en producción usaremos JWT service
        //if (!authHeader || !authHeader.startsWith('Bearer ')) {
           // throw new HttpException('Token invalido', HttpStatus.UNAUTHORIZED);
        //}
    
        //const token = authHeader.substring(7);
        // Aquí iría la lógica para decodificar el JWT y obtener el userId
        // Por ahora retornamos un mock
        return authHeader;
    }

    @Post()
    async createSession(
        @Body() body: CreateSessionRequestDto,
        @Headers('authorization') authHeader?: string
    ):Promise<CreateSessionResponseDto>{
    
        if (!authHeader) {
            throw new UnauthorizedException('No se encuentra el header de autorización');
        }
    
        try {
            const hostId = this.extractUserIdFromToken(authHeader);
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
    
}