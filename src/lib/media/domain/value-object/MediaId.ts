
import { randomUUID } from 'crypto';
import { DomainException } from '../../../shared/exceptions/domain.exception';

const UUID_ANY_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(value: string): boolean {
  return UUID_ANY_REGEX.test(value);
}
// --- VOs de Identidad ---
export class MediaId {
    private constructor(public readonly value: string) { if (!isValidUUID(value)) { throw new DomainException(`MediaId does not have a valid UUID v4 format: ${value}`); } }
    public static of(value: string): MediaId { return new MediaId(value); }
    public static generate(): MediaId { return new MediaId(randomUUID()); }
    public getId(): string { return this.value; }
}

export class AuthorId {
    private constructor(public readonly value: string) { if (!isValidUUID(value)) { throw new DomainException(`AuthorId does not have a valid UUID v4 format: ${value}`); } }
    public static of(value: string): AuthorId { return new AuthorId(value); }
    public getId(): string { return this.value; }
}

// --- VOs de Contenido ---
export class MediaName {
    private constructor(public readonly value: string) { if (value.length < 1 || value.length > 255) { throw new DomainException("MediaName must be between 1 and 255 characters."); } }
    public static of(value: string): MediaName { return new MediaName(value); }
    public getValue(): string { return this.value; }
}

export class MediaUrl {
    private constructor(public readonly value: string) { try { new URL(value); } catch (_) { throw new DomainException(`Invalid URL format for MediaUrl: ${value}`); } }
    public static of(value: string): MediaUrl { return new MediaUrl(value); }
    public getValue(): string { return this.value; }
}

export class MediaMimeType {
    private constructor(public readonly value: string) { if (!value.includes('/')) { throw new DomainException("MimeType is not in a valid format."); } }
    public static of(value: string): MediaMimeType { return new MediaMimeType(value); }
    public getValue(): string { return this.value; }
}

export class MediaSize {
    private constructor(public readonly value: number) { if (value < 0) { throw new DomainException("MediaSize cannot be negative."); } }
    public static of(value: number): MediaSize { return new MediaSize(value); }
    public getValue(): number { return this.value; }
}

export class MediaFormat {
    private constructor(public readonly value: string) { if (value.length === 0) { throw new DomainException("MediaFormat cannot be empty."); } }
    public static of(value: string): MediaFormat { return new MediaFormat(value); }
    public getValue(): string { return this.value; }
}

export class MediaCategory {
    private constructor(public readonly value: string) { if (value.length < 3 || value.length > 50) { throw new DomainException("MediaCategory must be between 3 and 50 characters."); } }
    public static of(value: string): MediaCategory { return new MediaCategory(value); }
    public getValue(): string { return this.value; }
}

// --- VOs de Fecha ---
export class CreatedAt {
    private constructor(public readonly value: Date) {}
    public static of(value: Date): CreatedAt { return new CreatedAt(value); }
    public static now(): CreatedAt { return new CreatedAt(new Date()); }
    public getValue(): Date { return this.value; }
}
