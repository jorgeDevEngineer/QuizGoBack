import { Inject, Injectable } from "@nestjs/common";
import { ActiveSessionContext, IActiveMultiplayerSessionRepository } from "../../domain/repositories/IActiveMultiplayerSessionRepository";
import { UuidGenerator } from "src/lib/shared/domain/ports/UuuidGenerator";

type sessionPin = string

type qrToken = string;

interface MemorySessionContext extends ActiveSessionContext { 
    lastActivity: number,
}

interface QrTokenData {
    pin: string;
    createdAt: number; // Timestamp en milisegundos
}


@Injectable()
export class InMemoryActiveSessionRepository implements IActiveMultiplayerSessionRepository {

    // * Aquí se guardaran los agregados asociados a cada sesión, todo es en memoria.
    // Al ser un Singleton, este Map vive mientras el servidor este corriendo.
    private readonly activeSessions = new Map<sessionPin, MemorySessionContext>();

    // * Mapa: QR Token -> PIN
    // Guardamos solo el PIN porque con el PIN ya podemos buscar en activeSessions
    // Mapa principal: Token -> Datos + Timestamp
    private readonly qrTokens = new Map<qrToken, QrTokenData>();

    // Configuración: Los tokens QR expiran rápido (ej. 10 minutos)
    // Esto es bueno por seguridad, el QR no debería ser eterno. (TTL -> Time To Live)
    private readonly QR_TTL = 10 * 60 * 1000;

    constructor(
        @Inject( 'UuidGenerator' )
        private readonly IdGenerator: UuidGenerator
    ) {
        // Limpiador de sesiones no usadas automático cada 10 minutos
        setInterval(() => this.cleanupUnusedSessions(), 10 * 60 * 1000);

        // limpiador de códigos qr cada 5 minutos
        setInterval(() => this.cleanupExpiredTokens(), 5 * 60 * 1000);
    }

    // Cada vez que se toque la sesión, actualiza lastActivity
    async saveSession(sessionWraper: MemorySessionContext): Promise<qrToken> {

        const { session, quiz } = sessionWraper;

        this.activeSessions.set( session.getSessionPin() , {
             session, 
             quiz,
             lastActivity: Date.now(), // Actualizamos el timestamp de última actividad, se deja el theme en undefined por ahora
        });

        // Generas un token aleatorio (puedes usar crypto.randomUUID())
        const token: qrToken = this.IdGenerator.generate()
        
        // Lo guardas mapeado al PIN
        // Guardamos cuándo se creó
        this.qrTokens.set( 
            token, 
            { 
                pin: session.getSessionPin(), 
                createdAt: Date.now() 
            }
        );
        return token;

    }


    async findByPin(pin: string): Promise<MemorySessionContext| null> {
        return this.activeSessions.get(pin) || null;
    }

    // Buscamos en este caso por qrToken
    async findByTemporalToken(token: string): Promise<MemorySessionContext | null> {
        const data = this.qrTokens.get(token);
        
        if ( !data ) 
            return null;

        // Si existe pero ya expiró (y el setInterval no ha pasado aún), lo borramos ahora
        if (Date.now() - data.createdAt > this.QR_TTL) {
            this.qrTokens.delete(token);
            return null;
        }

        return this.findByPin( data.pin );
    }

    
    async delete(pin: string): Promise<void> {
        this.activeSessions.delete( pin );
    }


    // ! Funciones de limpieza de memoria
    private cleanupUnusedSessions() {
        const now = Date.now();
        const MAX_INACTIVITY = 1 * 60 * 60 * 1000; // 1 horas, por ejemplo

        for (const [pin, wrapper] of this.activeSessions.entries()) {

            if (now - wrapper.lastActivity > MAX_INACTIVITY) {
                console.log(`Eliminando sesión inutilizada: ${pin}`);
                this.activeSessions.delete(pin);
            }

        }
    }

    private cleanupExpiredTokens() {
        const now = Date.now();
        
        for (const [token, data] of this.qrTokens.entries()) {

            if (now - data.createdAt > this.QR_TTL) {
                this.qrTokens.delete(token);
            }

        }
    }
    
}  