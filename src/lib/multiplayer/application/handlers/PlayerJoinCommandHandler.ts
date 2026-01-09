import { Inject } from "@nestjs/common";
import { IHandler } from "src/lib/shared/IHandler";
import { PlayerJoinCommand } from "../parameterObjects/PlayerJoinCommand";
import { LobbyStateUpdateResponseDto } from "../responseDtos/LobbyStateUpdateResponse.dto";
import { PlayerFactory } from "../../domain/factories/PlayerFactory";
import { UserRepository } from "src/lib/user/domain/port/UserRepository";
import { IActiveMultiplayerSessionRepository } from "../../domain/repositories/IActiveMultiplayerSessionRepository";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { MapJoinToLobbyUpdate } from "../mappers/MapJoinToLobbyUpdate";

export class PlayerJoinCommandHandler implements IHandler<PlayerJoinCommand, LobbyStateUpdateResponseDto> {

    constructor(
        @Inject( 'IActiveMultiplayerSessionRepository' )
        private readonly sessionRepository: IActiveMultiplayerSessionRepository,

        @Inject( 'UserRepository' )
        private readonly userRepository: UserRepository,
    ) {}

    async execute(command: PlayerJoinCommand):Promise<LobbyStateUpdateResponseDto> {

        const sessionWrapper = await this.sessionRepository.findByPin( command.sessionPin );
        if ( !sessionWrapper ){
            throw new Error('No se encontró la sesión');
        }
        const { session } = sessionWrapper

        //Buscamos al usuario, si no existe lo unimos a la sesión como Invitado
        let isGuest: boolean = false
        const user = await this.userRepository.getOneById( UserId.of(command.userId));
        if ( !user ){
            isGuest = true;
        }
        const player = PlayerFactory.createPlayerForSession(
            command.userId,
            command.nickname,
            isGuest,
        );

        //Lo unimos a la Sesión
        // Primero verificamos si ya estaba unido, de ser así borramos manualmente su anterior registro y ponemos el nuevo actualizado
        if( session.isPlayerAlreadyJoined(player.getId()) ){
            session.deletePlayer( player.getId() );
        }
        session.joinPlayer( player );

        const response = MapJoinToLobbyUpdate( player, session );
        return response;
    }

}
