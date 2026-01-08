import { UuidGenerator } from "./ports/UuuidGenerator";

/**
 * Encapsula un identificador para una Partida de un Kahoot (UUID v4).
 */
export class SinglePlayerGameId {

    private static readonly UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    private constructor(private readonly gameId: string) {
        if (!SinglePlayerGameId.UUID_V4_REGEX.test(gameId)) {
            throw new Error(`SinglePlayerGameId does not have valid UUID v4 format: ${gameId}`);
        }
    }

    public static of(gameId: string): SinglePlayerGameId {
        return new SinglePlayerGameId(gameId);
    }

    public static generate(uuidGenerator: UuidGenerator): SinglePlayerGameId {
        const generatedId = uuidGenerator.generate();
        return new SinglePlayerGameId(generatedId);
    }

    public getId(): string {
        return this.gameId;
    }
}


/**
 * Encapsula un identificador para una sesión multijugador de un Kahoot (UUID v4).
 */
export class MultiplayerSessionId {

    private static readonly UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    private constructor(private readonly sessionId:string){
        if(!MultiplayerSessionId.UUID_V4_REGEX.test(sessionId)){
            throw new Error(`MultiplayerGameId does not have a valid UUID v4 format: ${sessionId}`);
        }
    }

    public static of(sessionId: string): MultiplayerSessionId{
        return new MultiplayerSessionId(sessionId);
    }

    public static generate(uuidGenerator: UuidGenerator): MultiplayerSessionId{
        const generatedId = uuidGenerator.generate();
        return new MultiplayerSessionId(generatedId);
    }

    public getId():string{
        return this.sessionId;
    }
}
