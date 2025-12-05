// 1. Quiz (Raíz del Agregado - Entidad)

// Esta es la entidad principal. Orquesta y valida la lógica de negocio general.
// _id: QuizId (Value Object)
// _authorId: UserId (Value Object - ID del agregado User)
// _title: QuizTitle (Value Object)
// _description: QuizDescription (Value Object)
// _visibility: Visibility (Value Object)
// _themeId: ThemeId (Value Object)
// _coverImage: MediaUrl (Value Object)
// _questions: Question[] (Lista de Entidades)

import { randomUUID } from 'crypto';
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isValidUUID(value: string): boolean {
    return UUID_V4_REGEX.test(value);
}

// --- VOs de Identidad ---
export class QuizId {
    private constructor(public readonly value: string) {
        if (!isValidUUID(value)) {
            throw new Error(`QuizId does not have a valid UUID v4 format: ${value}`);
        }
    }
    public static of(value: string): QuizId {
        return new QuizId(value);
    }
    public static generate(): QuizId {
        return new QuizId(randomUUID());
    }
    public getValue():string {
        return this.value;
    }
}

/**
 * Encapsula un identificador único (UUID) para un Usuario, proveyendo seguridad de tipos.
 */
export class UserId {
    private constructor(public readonly value: string) {
        if (!isValidUUID(value)) {
            throw new Error(`UserId does not have a valid UUID v4 format: ${value}`);
        }
    }
    public static of(value: string): UserId {
        return new UserId(value);
    }
    public static generate(): UserId {
        return new UserId(randomUUID());
    }
    public getValue():string{
        return this.value;
    }
}

/**
 * Encapsula un identificador para un Tema (UUID v4).
 */
export class ThemeId {
    private constructor(public readonly value: string) {
        if (!isValidUUID(value)) {
            throw new Error("ThemeId must be a valid UUID v4.");
        }
    }
    public static of(value: string): ThemeId {
        return new ThemeId(value);
    }
    public static generate(): ThemeId {
        return new ThemeId(randomUUID());
    }
}


// --- VOs de Contenido ---

/**
 * Encapsula el título de un Quiz, validando su longitud.
 */
export class QuizTitle {
    private constructor(public readonly value: string) {
        if (value.length < 1 || value.length > 95) {
            throw new Error("QuizTitle must be between 1 and 95 characters.");
        }
    }
    public static of(value: string): QuizTitle {
        return new QuizTitle(value);
    }
}

/**
 * Encapsula la descripción de un Quiz.
 */
export class QuizDescription {
    private constructor(public readonly value: string) {
        if (value.length > 500) { // Asumiendo una longitud máxima razonable
            throw new Error("QuizDescription cannot be longer than 500 characters.");
        }
    }
    public static of(value: string): QuizDescription {
        return new QuizDescription(value);
    }
}

export class QuizStatus {
    private constructor(public readonly value: 'draft' | 'published') {}

    public static fromString(value: string): QuizStatus {
        if (value !== 'draft' && value !== 'published') {
            throw new Error(`Invalid QuizStatus: ${value}`);
        }
        return new QuizStatus(value as 'draft' | 'published');
    }
}

export class QuizCategory {
    private constructor(public readonly value: string) {
        if (value.length < 3 || value.length > 50) {
            throw new Error("QuizCategory must be between 3 and 50 characters.");
        }
    }
    public static of(value: string): QuizCategory {
        return new QuizCategory(value);
    }
}

/**
 * Encapsula una URL para un recurso multimedia, validando su formato.
 */
export class MediaUrl {
    private constructor(public readonly value: string | null) {
        if (value) {
            try {
                new URL(value);
            } catch (_) {
                throw new Error(`Invalid URL format for MediaUrl: ${value}`);
            }
        }
    }
    public static of(value: string | null): MediaUrl {
        return new MediaUrl(value);
    }
}


// --- VOs de Estado ---

type VisibilityValue = 'public' | 'private';
/**
 * Encapsula el estado de visibilidad de un Quiz.
 */
export class Visibility {
    private constructor(public readonly value: VisibilityValue) {}

    public static public(): Visibility {
        return new Visibility('public');
    }
    public static private(): Visibility {
        return new Visibility('private');
    }
    public static fromString(value: string): Visibility {
        if (value !== 'public' && value !== 'private') {
            throw new Error("Visibility must be 'public' or 'private'.");
        }
        return new Visibility(value as VisibilityValue);
    }
}

// NOTA: Question no es un Value Object, es una Entidad.
// Se construirá usando sus propios VOs (QuestionId, QuestionText, etc.)
// y se gestionará a través de la raíz del agregado, que es la entidad Quiz.