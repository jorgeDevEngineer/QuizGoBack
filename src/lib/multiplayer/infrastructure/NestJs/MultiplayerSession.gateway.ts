import { BadRequestException, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { Server } from 'socket.io';

//import { MultiplayerSessionsTracingService } from './multiplayer-sessions.tracing.service';

import { SessionRoles } from '../helpers/SessionRoles.enum';
import { ClientEvents, HostUserEvents, PlayerUserEvents, ServerErrorEvents, ServerEvents } from '../helpers/WebSocketEvents.enum';

//import type { SessionSocket  } from './interfaces/socket-definitions.interface';

import { PlayerJoinCommand } from '../../application/parameterObjects/PlayerJoinCommand';

import { HostLobbyUpdateResponseDto } from '../../application/responseDtos/LobbyStateUpdateResponse.dto';
import { LobbyStateUpdateResponseDto } from '../../application/responseDtos/LobbyStateUpdateResponse.dto';
import { PlayerLobbyUpdateResponseDto } from '../../application/responseDtos/LobbyStateUpdateResponse.dto';

import { PlayerJoinDto } from '../requestesDto/PlayerJoin.dto';




