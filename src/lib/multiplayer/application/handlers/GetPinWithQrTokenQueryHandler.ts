import { IHandler } from "src/lib/shared/IHandler";
import { GetPinWithQrTokenQuery } from "../parameterObjects/GetPinWithQrTokenQuery";
import { GetPinWithQrTokenResponseDto } from "../responseDtos/GetPinWithQrTokenResponse.dto";
import { IActiveMultiplayerSessionRepository } from "../../domain/repositories/IActiveMultiplayerSessionRepository";
import { COMMON_ERRORS } from "./Errors/CommonErrors";
import { Inject } from "@nestjs/common";

export class GetPinWithQrTokenQueryHandler implements IHandler<GetPinWithQrTokenQuery, GetPinWithQrTokenResponseDto> {

    constructor(
        @Inject('IActiveMultiplayerSessionRepository')
        private readonly sessionRepository: IActiveMultiplayerSessionRepository,
    ) {}

    async execute(query: GetPinWithQrTokenQuery): Promise<GetPinWithQrTokenResponseDto> {

        const searchedSession = await this.sessionRepository.findByTemporalToken( query.qrToken );
        if (!searchedSession){
            throw new Error(COMMON_ERRORS.SESSION_NOT_FOUND);
        }

        const pin = searchedSession.session.getSessionPin();

        return {
            sessionPin: pin,
        }

    }

}
