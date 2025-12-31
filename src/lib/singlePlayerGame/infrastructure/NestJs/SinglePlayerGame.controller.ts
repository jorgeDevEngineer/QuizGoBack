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
import { 
    SubmitGameAnswerResponseDto, 
    GameProgressResponseDto, 
    GameSummaryResponseDto, 
    StartGameResponseDto 
} from "../../application/dtos/SinglePlayerGameResponses.dto";;
import { StartGameRequestDto, SubmitGameAnswerRequestDto } from "../../application/dtos/SinglePlayerGameRequests.dto";
import { IHandler } from "src/lib/shared/IHandler";
import { StartSinglePlayerGameCommand } from "../../application/parameterObjects/StartSinglePlayerGameCommand";
import { SubmitGameAnswerCommand } from "../../application/parameterObjects/SubmitGameAnswerCommand";
import { GetGameProgressQuery } from "../../application/parameterObjects/GetGameProgressQuery";
import { GetGameSummaryQuery } from "../../application/parameterObjects/GetGameSummaryQuery";

@Controller('attempts')
export class SinglePlayerGameController {

    constructor(
        @Inject('StartSinglePlayerGameCommandHandler')
        private readonly StartSinglePlayerGameHandler: IHandler<StartSinglePlayerGameCommand, StartGameResponseDto>,

        @Inject('GetGameProgressQueryHandler')
        private readonly GetGameProgressHandler: IHandler<GetGameProgressQuery, GameProgressResponseDto>,

        @Inject('SubmitGameAnswerCommandHandler')
        private readonly SubmitGameAnswerHandler: IHandler<SubmitGameAnswerCommand, SubmitGameAnswerResponseDto>,

        @Inject('GetGameSummaryQueryHandler')
        private readonly GetGameSummaryHandler: IHandler<GetGameSummaryQuery, GameSummaryResponseDto> 
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
    async startGame(
        @Body() body: StartGameRequestDto,
        @Headers('authorization') authHeader?: string
    ):Promise<StartGameResponseDto>{

        if (!authHeader) {
            throw new UnauthorizedException('No se encuentra el header de autorización');
        }

        try {
            const playerId = this.extractUserIdFromToken(authHeader);
            return await this.StartSinglePlayerGameHandler.execute({
                kahootId: body.kahootId,
                playerId
            });
        } catch (error) {
            if (error.message === `No se encontró el quiz de id ${body.kahootId}`) {
                throw new HttpException(`Quiz de id ${body.kahootId} no encontrado`, HttpStatus.NOT_FOUND);
            }
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Get(':attemptId')
    async getProgress(
        @Param('attemptId') attemptId: string,
        @Headers('authorization') authHeader?: string
    ): Promise<GameProgressResponseDto> {

        if (!authHeader) {
            throw new UnauthorizedException('No se encuentra el header de autorización');
        }

        try {
            return await this.GetGameProgressHandler.execute({ attemptId });
        } catch (error) {
            if (error.message === `No se encontró la partida de id ${attemptId}`) {
                throw new HttpException(`Partida de id ${attemptId} no encontrada`, HttpStatus.NOT_FOUND);
            }
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }

    }

    @Post(':attemptId/answer')
    async submitAnswer(
        @Param('attemptId') attemptId: string,
        @Body() body: SubmitGameAnswerRequestDto,
        @Headers('authorization') authHeader?: string
    ): Promise<SubmitGameAnswerResponseDto> {

        if (!authHeader) {
            throw new UnauthorizedException('No se encuentra el header de autorización');
        }

        try {
            return await this.SubmitGameAnswerHandler.execute({
                attemptId,
                slideId: body.slideId,
                answerIndex: body.answerIndex,
                timeElapsedSeconds: body.timeElapsedSeconds
            });
        } catch (error) {
            if (error.message === `No se encontró la partida de id ${attemptId}`) {
                throw new HttpException(`Partida de id ${attemptId} no encontrada`, HttpStatus.NOT_FOUND);
            }
            if (error.message === 'La partida ya ha sido completada') {
                throw new HttpException('La partida ya ha sido completada', HttpStatus.BAD_REQUEST);
            }
            if (error.message === 'La pregunta que se quiere responder ya ha sido respondida') {
                throw new HttpException('La pregunta que se quiere responder ya ha sido respondida', HttpStatus.BAD_REQUEST);
            }
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }

    }

    @Get(':attemptId/summary')
    async getSummary(
        @Param('attemptId') attemptId: string,
        @Headers('authorization') authHeader: string
    ): Promise<GameSummaryResponseDto> {

        if (!authHeader) {
            throw new UnauthorizedException('No se encuentra el header de autorización');
        }


        try {
            return await this.GetGameSummaryHandler.execute({ attemptId });
        } catch (error) {
            if (error.message === `No se encontró la partida de id ${attemptId}`) {
                throw new HttpException(`Quiz de id ${attemptId} no encontrado`, HttpStatus.NOT_FOUND);
            }
            if (error.message === 'La partida no ha sido completada por lo que no se puede ver el resumen de partida') {
                throw new HttpException('La partida no ha sido completada por lo que no se puede ver el resumen de partida', HttpStatus.BAD_REQUEST);
            }
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }

    }

}