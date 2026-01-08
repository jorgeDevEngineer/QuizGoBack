import { UuidGenerator } from "../../../shared/domain/ports/UuuidGenerator";

/**
 * Encapsula un identificador para un archivo de medios (UUID v4).
 */
export class MediaId {

    private static readonly UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    private constructor(private readonly mediaId: string) {
        if (!MediaId.UUID_V4_REGEX.test(mediaId)) {
            throw new Error(`MediaId does not have valid UUID v4 format: ${mediaId}`);
        }
    }

    public static of(mediaId: string): MediaId {
        return new MediaId(mediaId);
    }

    public static generate(uuidGenerator: UuidGenerator): MediaId {
        const generatedId = uuidGenerator.generate();
        return new MediaId(generatedId);
    }

    public getId(): string {
        return this.mediaId;
    }
}
