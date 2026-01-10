import { UuidGenerator } from "src/lib/shared/domain/ports/UuuidGenerator";

/**
 * Encapsula un identificador para un jugador de una sesión multijugador (solo le interesa a la sesión así que no está en shared)
 */
export class PlayerId {
    
    private static readonly UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    private constructor(private readonly playerId: string) {
        if (!PlayerId.UUID_V4_REGEX.test(playerId)) {
            throw new Error(`SinglePlayerGameId does not have valid UUID v4 format: ${playerId}`);
        }
    }

    public static of(playerId: string): PlayerId {
        return new PlayerId(playerId);
    }

    public static generate(uuidGenerator: UuidGenerator): PlayerId {
        const generatedId = uuidGenerator.generate();
        return new PlayerId(generatedId);
    }

    public getId(): string {
        return this.playerId;
    }

    public equals(id: PlayerId): boolean {
        return this.playerId === id.getId();
    }
}

/**
 * Encapsula el nombre de un jugador en una sesión multijugador
 */
export class PlayerNickname {

    private constructor(private readonly nickname:string) {
        if (!this.isValid(nickname)){
            throw new Error('El nickname debe tener entre 4 y 20 caracteres');
        }
    }

    public static create(nickname:string):PlayerNickname {
        return new PlayerNickname(nickname);
    }

    private isValid(nickname:string):boolean{
        return nickname.length >= 4 && nickname.length <= 20;
    }

    public getNickname(): string {
        return this.nickname;
    }
}

export const MAX_NICKNAME_TEXT_LENGTH = 20; 
export const MIN_NICKNAME_TEXT_LENGTH = 4;