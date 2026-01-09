import { Injectable } from '@nestjs/common';
import { SessionRoles } from '../helpers/SessionRoles.enum';
import { SessionSocket } from '../helpers/SocketInterface';

interface ConnectedClients {

    [id: string]: {

        socket: SessionSocket,
        roomPin: string
        role: SessionRoles, 

        // Para el Jugador
        nickname?: string,
        
        // Para el Host
        userId?: string,
        socketId?: string,

    } | undefined

}

@Injectable()
export class MultiplayerSessionsTracingService {

    private availableRooms: Map<string, ConnectedClients> = new Map<string, ConnectedClients>();

    // --------------------------------------------------------------------------
    // * Métodos de registro para trazabiblidad
    // --------------------------------------------------------------------------

    registerRoom( client: SessionSocket ){

        const roomPin = client.handshake.headers.pin as string;

        this.availableRooms.set( roomPin, {} );

    }

    registerClient( client: SessionSocket ): void {


        const roomPin = client.data.roomPin;

        const role = client.data.role

        const room = this.getRoom( roomPin );

        if(!room)
            return

        if( role === SessionRoles.HOST ){

            room["host"] = {
                socket: client,
                roomPin: roomPin,
                role: role,  
                userId: client.data.userId,
                socketId: client.id as string 
            }

        } else {

            room[ client.id as string ] = {
                socket: client,
                roomPin: roomPin,
                role: role,  
            };


        }

    } 

    registerClientNickname( client: SessionSocket ): void {

        const room = this.getRoom( client.data.roomPin );

        if(!room)
            return

        const clientInRoom = room[ client.id ];

        if( clientInRoom )
            clientInRoom.nickname = client.data.nickname;

    }

    // --------------------------------------------------------------------------
    // * Métodos de eliminación de registros
    // --------------------------------------------------------------------------


    removeClient( roomPin: string, clientId: string){

        const room = this.getRoom( roomPin );

        // IMPORTANTE: Si no encontramos sala para este cliente, 
        // significa que nunca se registró correctamente o ya se borró.
        // Simplemente retornamos sin hacer nada (return), NO lanzamos error.
        if(!room)
            return;

        delete room[ clientId ];
    }


    removeHost( roomPin: string ) {

        const room = this.getRoom( roomPin );

        if(!room)
            return;

        delete room["host"];
    }



    removeRoom( roomPin: string ){

        const roomExists = this.availableRooms.has( roomPin );

        // IMPORTANTE: Si no encontramos sala para este cliente, significa que nunca se registró correctamente o ya se borró.
        // Simplemente retornamos sin hacer nada (return), NO lanzamos error.
        if( !roomExists )
            return;

        const deleted = this.availableRooms.delete( roomPin );

    }

    // --------------------------------------------------------------------------
    // * Métodos de comprobación de existencia de registros
    // --------------------------------------------------------------------------

    roomHasHost( roomPin: string ): boolean {
        const room = this.getRoom( roomPin );

        if(!room)
            return false

        const hostClient = room["host"];

        return hostClient !== undefined;
    }

    roomExist( roomPin: string ): boolean {

        return this.availableRooms.has( roomPin );

    }

    getRoomHostSocketId( roomPin: string ): string | undefined {
        const room = this.getRoom( roomPin );

        if(!room)
            return undefined;

        if( this.roomHasHost( roomPin ) )
            return room["host"]?.socket.id;

        return undefined;
    }

    
    // --------------------------------------------------------------------------
    // * Métodos de loggeo
    // --------------------------------------------------------------------------

    logConnectedClients(): void {

        const availableRooms = this.getAvailableRooms();

        availableRooms.forEach( room => {
            console.log( room );
        });
    

    }

    // --------------------------------------------------------------------------
    // ? Métodos Privados
    // --------------------------------------------------------------------------

    private getAvailableRooms() {

        const listOfRooms = [ ...this.availableRooms ]
                                .map( tuple => ({
                                    roomPin: tuple[0],
                                    conectadosAEstaSala: {
                                        ...tuple[1]
                                    }
                                }))

        return listOfRooms; 
    }

    private getRoom( roomPin: string ): ConnectedClients | undefined {
        const room = this.availableRooms.get( roomPin );

        if(!room)
            return undefined

        return room;
    }

}