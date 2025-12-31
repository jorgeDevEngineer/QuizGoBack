import { UuidGenerator } from "src/lib/shared/domain/ports/UuuidGenerator";

/**
 * Encapsula un identificador para un jugador de una sesión multijugador (solo le interesa a la sesión así que no está en shared)
 */
export class PlayerId {
    
    private constructor(private readonly playerId: string) {}

    public static of(playerId: string, uuidGenerator: UuidGenerator): PlayerId {
        if (!uuidGenerator.isValid(playerId)) {
            throw new Error(`PlayerId does not have a valid UUID v4 format: ${playerId}`);
        }
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
