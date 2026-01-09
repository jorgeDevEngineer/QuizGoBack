//Necesario para el Gateway
import { BadRequestException, Logger, Inject, Injectable } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { MultiplayerSessionsTracingService } from './MultiplayerSession.tracing.service';
import { SessionRoles } from '../helpers/SessionRoles.enum';
import { ClientEvents, HostUserEvents, PlayerUserEvents, ServerErrorEvents, ServerEvents } from '../helpers/WebSocketEvents.enum';
import type { SessionSocket } from '../helpers/SocketInterface';

//Commands and Handlers
import { PlayerJoinCommand } from '../../application/parameterObjects/PlayerJoinCommand';
import { PlayerJoinCommandHandler } from '../../application/handlers/PlayerJoinCommandHandler';

//Dtos
import { HostLobbyUpdateResponseDto } from '../../application/responseDtos/LobbyStateUpdateResponse.dto';
import { LobbyStateUpdateResponseDto } from '../../application/responseDtos/LobbyStateUpdateResponse.dto';
import { PlayerLobbyUpdateResponseDto } from '../../application/responseDtos/LobbyStateUpdateResponse.dto';
import { PlayerJoinDto } from '../requestesDto/PlayerJoin.dto';

//Repositorios
import { IActiveMultiplayerSessionRepository } from '../../domain/repositories/IActiveMultiplayerSessionRepository';

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
                this.tracingWsService.registerClient(client); // También registrar el host como cliente

            } else if (validRole === SessionRoles.PLAYER) {

                await this.verifyConnectionAvailability(pin as string, jwt as string);

                this.tracingWsService.registerClient(client); // Registrar jugador (sin nickname aún)

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