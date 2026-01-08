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
}
