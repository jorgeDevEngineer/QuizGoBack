// Gateway y helpers
import { BadRequestException, Logger, Inject, Injectable } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { MultiplayerSessionsTracingService } from './MultiplayerSession.tracing.service';
import { SessionRoles } from '../helpers/SessionRoles.enum';
import { ClientEvents, HostUserEvents, PlayerUserEvents, ServerErrorEvents, ServerEvents } from '../helpers/WebSocketEvents.enum';
import type { SessionSocket } from '../helpers/SocketInterface';
import { SyncType } from '../../application/responseDtos/enums/SyncType.enum';
import { LobbydditionalData, QuestionAdditionalData } from '../../application/responseDtos/SyncStateResponse.dto';
import { COMMON_ERRORS } from '../../application/handlers/Errors/CommonErrors';

//Commands and Handlers
import { PlayerJoinCommandHandler } from '../../application/handlers/PlayerJoinCommandHandler';
import { SyncStateCommandHandler } from '../../application/handlers/SyncStateCommandHandler';

//Dtos
import { HostLobbyUpdateResponseDto } from '../../application/responseDtos/LobbyStateUpdateResponse.dto';
import { LobbyStateUpdateResponseDto } from '../../application/responseDtos/LobbyStateUpdateResponse.dto';
import { QuestionResultsHostResponseDto, QuestionResultsPlayerResponseDto } from '../../application/responseDtos/QuestionResultResponses.dto';
import { HostEndGameResponseDto, PlayerEndGameResponseDto } from '../../application/responseDtos/GameEndedResponses.dto';
import { QuestionStartedResponseDto } from '../../application/responseDtos/QuestionStartedResponse.dto';
import { PlayerLobbyUpdateResponseDto } from '../../application/responseDtos/LobbyStateUpdateResponse.dto';
import { PlayerJoinDto } from '../requestesDto/PlayerJoin.dto';

//Repositorios
import { IActiveMultiplayerSessionRepository } from '../../domain/repositories/IActiveMultiplayerSessionRepository';

//


@WebSocketGateway( 
  { namespace: 'multiplayer-sessions', cors: true }
)
@Injectable()
export class MultiplayerSessionsGateway  implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer() wss: Server;
    
    private readonly logger: Logger = new Logger('WebSocketGateway');

    // Maps de timers para desconexion, uno para espera de sincronizacion, otro para espera de reconexion de un host
    private readyTimeouts = new Map<string, NodeJS.Timeout>();
    private hostDisconnectionTimers = new Map<string, NodeJS.Timeout>();

    constructor(
        @Inject('IActiveMultiplayerSessionRepository')
        private readonly sessionRepository: IActiveMultiplayerSessionRepository,
    
        @Inject('PlayerJoinCommandHandler')
        private readonly playerJoinHandler: PlayerJoinCommandHandler,

        @Inject('SyncStateCommandHandler')
        private readonly syncStateHandler: SyncStateCommandHandler,

        private readonly tracingWsService: MultiplayerSessionsTracingService,
    ) {
      this.logger.log(`WebSocket Gateway inicializado en namespace /multiplayer-sessions`);
    }

    async handleConnection(client: SessionSocket) {
        const { pin, role, jwt } = client.handshake.headers;

        try {
            // 1) Validación básica de tener todos los headers
            if (!pin || !role || !jwt) {
                throw new WsException("Hacen falta datos en el header para realizar la conexión");
            }

            // Validar que el rol sea válido
            const validRole = role as SessionRoles;
            if (![SessionRoles.HOST, SessionRoles.PLAYER].includes(validRole)) {
                throw new WsException("Rol inválido. Debe ser HOST o PLAYER");
            }

            // 2) Guardamos la data inmediatamente de los clientes en su propio socket
            // Hacemos esto antes de cualquier await para que se tengan los datos
            client.data.roomPin = pin as string;

            client.data.role = role as SessionRoles;

            client.data.userId = jwt as string; 

            // 3) Validaciones de Dominio (Asíncronas)
            // Equivalente a: await this.commandBus.execute(new VerifyPinCommand(pin as string));
            await this.verifyPin(pin as string);

            if (validRole === SessionRoles.HOST) {

                await this.verifyHost(pin as string, jwt as string);

                // Verificar que no haya ya un host conectado
                if (this.tracingWsService.roomHasHost(pin as string)) {
                    throw new WsException('Ya hay un host conectado a esta sesión');
                }

                this.tracingWsService.registerRoom(client); // Registramos La sala en nuestro servicio de Loggeo
                this.tracingWsService.registerClient(client);

            } else if (validRole === SessionRoles.PLAYER) {

                await this.verifyConnectionAvailability(pin as string, jwt as string);
                this.tracingWsService.registerClient(client);


            } else {
                client.disconnect(true); // En caso de no ser ninguno de esos roles, desconectamos inmediatamente
                return;
            }

            // 4) Gestionamos la union a la sala y al logger
            await client.join(pin as string);

            this.logger.log(`Socket [${client.id}: ${client.data.role}] validado y unido a sala ${pin}. Esperando CLIENT_READY.`);

            // 5) Dejamos en espera la confirmación de sincronización
            const confirmationTime = Number(process.env.CLIENT_CONFIRMATION_TIME) || 60000; // 1 min default
            const timeout = setTimeout(() => {
                if (this.readyTimeouts.has(client.id)) {
                    this.logger.warn(`Socket ${client.id} nunca envió CLIENT_READY. Desconectando...`);
                    client.disconnect(true);
                    this.readyTimeouts.delete(client.id);

                    // Limpiar del tracing service si nunca se sincronizó
                    if (client.data.role === SessionRoles.HOST) {
                        this.tracingWsService.removeHost(pin as string);
                    } else {
                        this.tracingWsService.removeClient(pin as string, client.id);
                    }
                }
            }, confirmationTime);

            this.readyTimeouts.set(client.id, timeout);

        } catch (error) {
            // Loggea el error para el servidor
            this.logger.error(`Fallo en la conexión del cliente ${client.id}:`, error);

            let errorMessage = 'Error desconocido en el servidor.';

            // Determinar el mensaje de error para el cliente
            if (error instanceof WsException) {
                errorMessage = error.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            // Notificar al cliente (importante: usa un evento conocido)
            client.emit(ServerErrorEvents.FATAL_ERROR, {
                statusCode: 400, // Usaremos equivalentes a los codigos HTTP
                message: `WS Bad Request: ${errorMessage}`
            });

            // Limpiar recursos del tracing service si se habían asignado
            if (client.data?.roomPin) {
                if (client.data.role === SessionRoles.HOST) {
                    this.tracingWsService.removeHost(client.data.roomPin);
                } else if (client.data.role === SessionRoles.PLAYER) {
                    this.tracingWsService.removeClient(client.data.roomPin, client.id);
                }
            }

            // Terminar la conexión para el cliente defectuoso
            // Retrasar la desconexión para permitir el envío del evento
            setTimeout(() => {
                client.disconnect(true);
                this.logger.log(`Cliente [${client.id}: ${client.data?.role}] desconectado después de error.`);
            }, 100);

            // También limpiar timeout si existía
            const pendingTimeout = this.readyTimeouts.get(client.id);
            if (pendingTimeout) {
                clearTimeout(pendingTimeout);
                this.readyTimeouts.delete(client.id);
            }
        }
    }

    async handleDisconnect(client: SessionSocket) {
        const { roomPin, role, userId, nickname } = client.data;

        // Aseguramos que la sala exista para evitar emitir eventos que no tocan o remover cosas del servicio de traza en momentos de cierre de sesión
        const roomExists = roomPin && this.tracingWsService.roomExist(roomPin);

        // Verificamos por si el usuario tiene algún timeout aún en memoria esperándolo, se pudo haber desconectado antes de hacer client_ready
        const pendingReadyTimeout = this.readyTimeouts.get(client.id);

        if (pendingReadyTimeout) {
            clearTimeout(pendingReadyTimeout);
            this.readyTimeouts.delete(client.id);
            this.logger.debug(`Limpiado readyTimeout para socket ${client.id} por desconexión temprana.`);
        }

        // Desconexión de Host y periodo de gracia para cerrar sala y desconectar jugadores
        if (role === SessionRoles.HOST && roomExists) {
            this.logger.warn(`Host se desconectó de la sala ${roomPin}. Iniciando periodo de gracia esperando reconexión.`);

            // Notificamos a los jugadores
            this.wss.to(roomPin).emit(ServerEvents.HOST_LEFT_SESSION, { 
                message: "El host ha abandonado la sesión por favor espere" 
            });

            const gracePeriod = Number(process.env.GRACE_PERIOD_TIME) || 120000; // 2 min default

            // Empezamos el timeout de espera del host, si no vuelve cerramos la sesión por completo
            const timeout = setTimeout(async () => {
                this.logger.error(`El tiempo de espera de reconexión expiró para sala ${roomPin}. Cerrando partida.`);
            
                await this.closeSession(roomPin);

                this.hostDisconnectionTimers.delete(roomPin);
            }, gracePeriod);

            this.hostDisconnectionTimers.set(roomPin, timeout);
        }

        // Desconexión de jugador
        // Solo hacemos esta notificación en caso de que el jugador ya haya confirmado que está sincronizado,
        // que tenga nickname registrado (hizo player_join) y la sala exista
        if (role === SessionRoles.PLAYER && !this.readyTimeouts.has(client.id) && nickname && roomExists) {
            // Notificamos al host
            const hostSocketId = this.tracingWsService.getRoomHostSocketId(roomPin);

            if (hostSocketId) {
                // En Socket.IO cada socket se une automáticamente a una sala con su propio ID
                // Buscamos el socket del host usando su ID
                const hostSocket = this.wss.sockets.sockets.get(hostSocketId);
            
                if (hostSocket) {
                    hostSocket.emit(ServerEvents.PLAYER_LEFT_SESSION, {
                        userId: userId,
                        nickname: nickname,
                        message: `El jugador ${nickname} se ha desconectado.`
                    });
                
                    this.logger.debug(`Jugador [${nickname}, ${userId}] salió de sala ${roomPin}. Host notificado.`);
                } else {
                    // Si el host no está encontrado por socket directo, usar fetchSockets
                    const sockets = await this.wss.in(hostSocketId).fetchSockets();
                    if (sockets.length > 0) {
                        sockets[0].emit(ServerEvents.PLAYER_LEFT_SESSION, {
                            userId: userId,
                            nickname: nickname,
                            message: `El jugador ${nickname} se ha desconectado.`
                        });
                    }
                }
            }
        }

        // Limpiar del tracing service
        if (roomExists) {
            try {
                if (role === SessionRoles.HOST) {
                    this.tracingWsService.removeHost(roomPin);
                } else {
                    this.tracingWsService.removeClient(roomPin, client.id);
                }
            } catch (error) {
                this.logger.warn(`Error al remover cliente [${client.id}: ${client.data.role}]: ${error.message}`);
            }
        }

        // También limpiar del hostDisconnectionTimers si el host se desconectó pero no había sala en tracing
        if (role === SessionRoles.HOST && roomPin) {
            const hostTimer = this.hostDisconnectionTimers.get(roomPin);
            if (hostTimer) {
                clearTimeout(hostTimer);
                this.hostDisconnectionTimers.delete(roomPin);
            }
        }

        this.logger.log(`Cliente Desconectado: [${client.id}: ${client.data.role}]`);
    }


    private async syncClientState(client: SessionSocket): Promise<void> {
        try {
            // Ejecutar el comando de sincronización
            const response = await this.syncStateHandler.execute({
                sessionPin: client.data.roomPin,
                userId: client.data.userId,
            });

            // Determinar el rol del cliente
            const isHost = client.data.role === SessionRoles.HOST;
            const isPlayer = client.data.role === SessionRoles.PLAYER;

            // Procesar la respuesta según el tipo de sincronización
            switch (response.type) {
                case SyncType.HOST_LOBBY_UPDATE:

                    // Emitir eventos específicos para host
                    client.emit(ServerEvents.HOST_CONNECTED_SUCCESS, { 
                        status: 'IN_LOBBY - CONNECTED TO SERVER' 
                    });
                    // response.data ya es HostLobbyUpdateResponseDto
                    client.emit(ServerEvents.HOST_LOBBY_UPDATE, response.data as HostLobbyUpdateResponseDto);
                    break;

                case SyncType.PLAYER_LOBBY_STATE_UPDATE:
                    // Verificar si el jugador ya estaba registrado (reconexión)
                    const lobbyData = response.data as LobbyStateUpdateResponseDto;
                
                    if (response.additionalData && (response.additionalData as LobbydditionalData)?.isJoined) {
                        // Jugador reconectando (ya tenía nickname)
                        const playerData = lobbyData.playerLobbyUpdate;
                        client.data.nickname = playerData.nickname;
                    
                        // Enviar datos de lobby al jugador
                        client.emit(ServerEvents.PLAYER_CONNECTED_TO_SESSION, playerData);
                    
                        // Registrar nickname en el servicio de tracing
                        this.tracingWsService.registerClientNickname(client);
                    
                        // Notificar al host sobre la reconexión del jugador
                        const hostSocketId = this.tracingWsService.getRoomHostSocketId(client.data.roomPin);
                        if (hostSocketId) {
                            const hostSocket = this.wss.sockets.sockets.get(hostSocketId);
                            if (hostSocket) {
                                hostSocket.emit(ServerEvents.HOST_LOBBY_UPDATE, lobbyData.hostLobbyUpdate);
                            }
                        }
                    } else {
                        // Jugador nuevo que nunca se ha unido - solo necesita confirmación de conexión
                        client.emit(ServerEvents.PLAYER_CONNECTED_TO_SERVER, { 
                            status: 'IN_LOBBY - CONNECTED TO SERVER' 
                        });
                    }
                    break;

                case SyncType.QUESTION_STARTED:
                    // response es SyncStateResponseDto genérico
                    // Necesitamos construir el payload según la estructura esperada
    
                    // Extraer los datos según la estructura de SyncStateResponseDto
                    // Para QUESTION_STARTED, data debería contener state y currentSlideData
                    const syncData = response.data as any; // Usamos any temporalmente
    
                    // Construir el payload según la API esperada
                    const questionPayload = {
                        state: syncData.state,
                        currentSlideData: syncData.currentSlideData,
                    };
    
                    // Agregar datos adicionales si existen (para reconexiones)
                    if (response.additionalData) {
                        const additionalData = response.additionalData as QuestionAdditionalData;
        
                        // Para host: solo timeRemainingMs
                        if (client.data.role === SessionRoles.HOST) {
                            (questionPayload as any).timeRemainingMs = additionalData.timeRemainingMs;
                        }
                        // Para jugador: ambos campos
                        else if (client.data.role === SessionRoles.PLAYER) {
                            (questionPayload as any).timeRemainingMs = additionalData.timeRemainingMs;
                            (questionPayload as any).hasAnswered = additionalData.hasAnswered || false;
                        }
                    }
    
                    client.emit(ServerEvents.QUESTION_STARTED, questionPayload);
                    break;

                case SyncType.HOST_RESULTS:
                    // Solo para host
                    if (isHost) {
                        client.emit(ServerEvents.HOST_RESULTS, response.data as QuestionResultsHostResponseDto);
                    } else {
                        this.logger.warn(`Jugador ${client.id} recibió tipo HOST_RESULTS - ignorando`);
                    }
                    break;

                case SyncType.PLAYER_RESULTS:
                    // Solo para jugadores
                    if (isPlayer) {
                    client.emit(ServerEvents.PLAYER_RESULTS, response.data as QuestionResultsPlayerResponseDto);
                    } else {
                        this.logger.warn(`Host ${client.id} recibió tipo PLAYER_RESULTS - ignorando`);
                    }
                    break;

                case SyncType.HOST_END_GAME:
                    // Solo para host
                    if (isHost) {
                        client.emit(ServerEvents.HOST_GAME_END, response.data as HostEndGameResponseDto);
                    } else {
                        this.logger.warn(`Jugador ${client.id} recibió tipo HOST_END_GAME - ignorando`);
                    }
                    break;

                case SyncType.PLAYER_END_GAME:
                    // Solo para jugadores
                    if (isPlayer) {
                        client.emit(ServerEvents.PLAYER_GAME_END, response.data as PlayerEndGameResponseDto);
                    } else {
                        this.logger.warn(`Host ${client.id} recibió tipo PLAYER_END_GAME - ignorando`);
                    }
                    break;

                default:
                    this.logger.error(`Tipo de sincronización no reconocido: ${response.type}`);
                    throw new WsException(`Tipo de sincronización no reconocido: ${response.type}`);
            }


        } catch (error) {
            this.logger.error(`Error en syncClientState para cliente ${client.id}:`, error);
        
            // Manejar errores específicos del dominio
            if (error instanceof Error) {
                // Error del dominio (sesión no encontrada, etc.)
                if (error.message.includes(COMMON_ERRORS.SESSION_NOT_FOUND)) {
                    client.emit(ServerErrorEvents.UNAVAILABLE_SESSION, {
                        statusCode: 404,
                        message: 'Sesión no encontrada'
                    });
                    throw new WsException('La sesión ya no está disponible');
                }
            
                // Otros errores del dominio
                client.emit(ServerErrorEvents.SYNC_ERROR, {
                    statusCode: 500,
                    message: `Error de sincronización: ${error.message}`
                });
                throw new WsException(`Error de sincronización: ${error.message}`);
            } else if (error instanceof WsException) {
                // Re-lanzar WsException para manejo superior
                throw error;
            } else {
                // Error genérico
                client.emit(ServerErrorEvents.SYNC_ERROR, {
                    statusCode: 500,
                    message: 'Error interno del servidor durante la sincronización'
                });
                throw new WsException('Error interno del servidor');
            }
        }
    }

    //Eventos

    @SubscribeMessage(ClientEvents.CLIENT_READY)
    async handleClientReady(client: SessionSocket) {
        this.logger.debug(`Recibido CLIENT_READY de ${client.data.role} (${client.id})`);

        // Limpiamos el timeout porque el cliente ya cumplió y notificó de que está listo para sincronizar
        const timeout = this.readyTimeouts.get(client.id);
        if (timeout) {
            clearTimeout(timeout);
            this.readyTimeouts.delete(client.id);
        }

        // Para cuando se reconecte un host que estaba desconectado
        if (client.data.role === SessionRoles.HOST) {
            const pendingTimer = this.hostDisconnectionTimers.get(client.data.roomPin);
            if (pendingTimer) {
                this.logger.log(`Host reconectado a sala ${client.data.roomPin}. Cancelando cierre de sala.`);
                clearTimeout(pendingTimer);
                this.hostDisconnectionTimers.delete(client.data.roomPin);

                this.tracingWsService.registerClient(client);
            
                // Notificamos a los jugadores
                this.wss.to(client.data.roomPin).emit(ServerEvents.HOST_RETURNED_TO_SESSION, { 
                    message: "El host ha recuperado la conexión con la sesión" 
                });
            }
        }

        try {
            // Llamamos a la sincronización ahora que el cliente nos confirma que está escuchando
            await this.syncClientState(client);
        
            this.logger.debug(`Cliente ${client.id} sincronizado exitosamente después de CLIENT_READY`);
        
        } catch (error) {
            this.logger.error(`Error en sincronización post-ready para cliente ${client.id}:`, error);
        
            let errorMessage = 'Error desconocido en la sincronización';
        
            if (error instanceof WsException) {
                errorMessage = error.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
        
            client.emit(ServerErrorEvents.SYNC_ERROR, { 
                statusCode: 500, 
                message: errorMessage 
            });
        
            // Retrasar la desconexión para permitir el envío del evento
            setTimeout(() => {
                client.disconnect(true);
                this.logger.log(`Cliente ${client.id} desconectado después de error en CLIENT_READY`);
            }, 100);
        
            return;
        }
    }

    @SubscribeMessage(PlayerUserEvents.PLAYER_JOIN)
    async handlePlayerJoin(client: SessionSocket, payload: PlayerJoinDto) {
        this.logger.debug(`Recibido PLAYER_JOIN de ${client.id} con nickname: ${payload.nickname}`);

        try {
            // 1. Validaciones básicas
            if (!client.rooms.has(client.data.roomPin)) {
                throw new WsException("FATAL: El cliente no se encuentra conectado a la sala solicitada");
            }

            if (client.data.role !== SessionRoles.PLAYER) {
                throw new WsException("El Host de la partida no puede unirse a la sesión de juego");
            }

            // 2. Validar nickname según API (6-20 caracteres)
            if (!payload.nickname || payload.nickname.length < 6 || payload.nickname.length > 20) {
                throw new WsException("El nickname debe tener entre 6 y 20 caracteres");
            }

            // 3. Ejecutar el comando de unión de jugador
            const result = await this.playerJoinHandler.execute({
                userId: client.data.userId,
                nickname: payload.nickname,
                sessionPin: client.data.roomPin
            });

            // 4. Guardar el nickname en el socket
            client.data.nickname = result.playerLobbyUpdate.nickname;
        
            // 5. Enviar confirmación al jugador según API
            // PLAYER_CONNECTED_TO_SESSION con: state, nickname, score, connectedBefore
            client.emit(ServerEvents.PLAYER_CONNECTED_TO_SESSION, result.playerLobbyUpdate);

            // 6. Notificar al host sobre el nuevo jugador
            const hostSocketId = this.tracingWsService.getRoomHostSocketId(client.data.roomPin);
            if (hostSocketId) {
                const sockets = await this.wss.in(hostSocketId).fetchSockets();
                if (sockets.length > 0) {
                    sockets[0].emit(ServerEvents.HOST_LOBBY_UPDATE, result.hostLobbyUpdate);
                }
            }

            // 7. Actualizar el nickname en el servicio de tracing
            this.tracingWsService.registerClientNickname(client);
        
            this.logger.debug(`Jugador ${payload.nickname} se unió exitosamente a la sala ${client.data.roomPin}`);

        } catch (error) {
            this.logger.error(`Error en PLAYER_JOIN para cliente ${client.id}:`, error);
        
            let errorMessage = 'Error al unirse a la sesión';
        
            if (error instanceof WsException) {
                errorMessage = error.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
        
            // Enviar error al cliente (podría ser FATAL_ERROR o game_error según API)
            client.emit(ServerErrorEvents.FATAL_ERROR, { 
                statusCode: 400, 
                message: errorMessage 
            });
        
        // NOTA: Según API página 6, player_join responde con:
        // Éxito: host_lobby_update (solo al host) y player_connected_to_session (solo al cliente)
        // Error: connection_error (solo al emisor)
        // Tu gateway actual usa FATAL_ERROR, que también es válido
        }
    }


    
    //Metodos de apoyo

    private async closeSession(roomPin: string): Promise<void> {
        this.logger.log(`Cerrando sesión ${roomPin}`);

        try {
            // 1. Notificar a todos los clientes
            this.wss.to(roomPin).emit(ServerEvents.SESSION_CLOSED, {
                reason: 'HOST_DISCONNECTED',
                message: 'El host no se reconectó a tiempo. La sesión ha sido cerrada.'
            });

            // 2. Limpiar timers
            const hostTimer = this.hostDisconnectionTimers.get(roomPin);
            if (hostTimer) {
                clearTimeout(hostTimer);
                this.hostDisconnectionTimers.delete(roomPin);
            }

            // 3. Limpiar readyTimeouts para todos los sockets en esta sala
            const sockets = await this.wss.in(roomPin).fetchSockets();
            sockets.forEach(socket => {
                const timeout = this.readyTimeouts.get(socket.id);
                if (timeout) {
                    clearTimeout(timeout);
                    this.readyTimeouts.delete(socket.id);
                }
            });

            // 4. Limpiar tracing service
            this.tracingWsService.removeRoom(roomPin);

            // 5. Desconectar a todos los sockets
            this.wss.in(roomPin).disconnectSockets(true);

            // 6. Opcional: Eliminar sesión del repositorio activo
            // await this.sessionRepository.delete(roomPin);

            this.logger.log(`Sesión ${roomPin} cerrada exitosamente`);

        } catch (error) {
            this.logger.error(`Error al cerrar sesión ${roomPin}: ${error.message}`);
            throw error;
        }
    }

    private async verifyPin(pin: string): Promise<void> {
        const sessionContext = await this.sessionRepository.findByPin(pin);
    
        if (!sessionContext) {
            throw new WsException(`No se encontró sesión con PIN: ${pin}`);
        }
    
        // Opcional: verificar estado
        const session = sessionContext.session;
        if (session.getSessionState().isEnd()) {
            throw new WsException('Esta sesión ya finalizó');
        }
    }

    private async verifyHost(pin: string, userId: string): Promise<void> {
        const sessionContext = await this.sessionRepository.findByPin(pin);
    
        if (!sessionContext) {
            throw new WsException(`No se encontró sesión con PIN: ${pin}`);
        }
    
        const session = sessionContext.session;
        const hostId = session.getHostId().getValue();
    
        if (userId !== hostId) {
            throw new WsException('No eres el host autorizado de esta sesión');
        }
    
        // Verificar que no haya otro host conectado
        if (this.tracingWsService.roomHasHost(pin)) {
            throw new WsException('Ya hay un host conectado a esta sesión');
        }
    }

    private async verifyConnectionAvailability(pin: string, userId: string): Promise<void> {
        const sessionContext = await this.sessionRepository.findByPin(pin);
    
        if (!sessionContext) {
            throw new WsException(`No se encontró sesión con PIN: ${pin}`);
        }
    
        const session = sessionContext.session;
    
        if (!session.getSessionState().isLobby()) {
            throw new WsException('La partida ya comenzó, no se pueden unir nuevos jugadores');
        }
    
        // Verificar que el usuario no esté ya en la sesión (opcional)
        const playerExists = session.getPlayers().some(
            player => player.getId().getId() === userId
        );
    
        if (playerExists) {
        // Esto no es un error, solo log
            this.logger.debug(`Usuario ${userId} ya está en la sesión ${pin}, permitiendo reconexión`);

        }
    }

}