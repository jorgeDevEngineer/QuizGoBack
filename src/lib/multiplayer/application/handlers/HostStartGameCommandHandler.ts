import { Inject } from "@nestjs/common";
import { HostStartGameCommand } from "../parameterObjects/HostStartGameCommand";
import { COMMON_ERRORS } from "./Errors/CommonErrors";
import { QuestionStartedResponseDto } from "../responseDtos/QuestionStartedResponse.dto";
import { IActiveMultiplayerSessionRepository } from "../../domain/repositories/IActiveMultiplayerSessionRepository";
import { MapToQuestionResponse } from "../mappers/MapToQuestionResponse";
import { QuestionId } from "src/lib/kahoot/domain/valueObject/Question";
import { IHandler } from "src/lib/shared/IHandler";

export class HostStartGameCommandHandler implements IHandler<HostStartGameCommand, QuestionStartedResponseDto> {

    constructor(
        @Inject( 'IActiveMultiplayerSessionRepository' )
        private readonly sessionRepository: IActiveMultiplayerSessionRepository,
    ){}

    async execute(command: HostStartGameCommand): Promise<QuestionStartedResponseDto> {

        const sessionWrapper = await this.sessionRepository.findByPin( command.sessionPin );

        if( !sessionWrapper ){
            throw new Error(COMMON_ERRORS.SESSION_NOT_FOUND);
        }


        const { session, quiz } = sessionWrapper
            
        // Iniciamos la partida
        session.startSession(); // Pasa a estado question automaticamente

        // Mapeamos la slide actual (la primera) a formato de opciones sin mostrar la respuesta correcta, y obtenemos directamente los datos de la respuesta a dar
        const response = await MapToQuestionResponse( session, quiz);

        session.startQuestionResults(QuestionId.of( response.data.currentSlideData.id ) );

        return response;
    }

}