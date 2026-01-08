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
import { IHandler } from "src/lib/shared/IHandler";

@Controller('multiplayer-sessions')
export class MultiplayerSessionControler {

    constructor(
        @Inject('CreateSessionCommandHandler')
        private readonly CreateSessionHandler: IHandler<CreateSessionCommand, CreateSessionResponseDto>
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
    
}