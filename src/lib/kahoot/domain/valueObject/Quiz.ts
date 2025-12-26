
import { randomUUID } from 'crypto';
import { DomainException } from '../../../../common/domain/domain.exception';

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isValidUUID(value: string): boolean {
    return UUID_V4_REGEX.test(value);
}

// --- VOs de Identidad ---
export class QuizId {
    private constructor(public readonly value: string) {
        if (!isValidUUID(value)) {
            throw new DomainException(`QuizId does not have a valid UUID v4 format: ${value}`);
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

export class UserId {
    private constructor(public readonly value: string) {
        if (!isValidUUID(value)) {
            throw new DomainException(`UserId does not have a valid UUID v4 format: ${value}`);
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

export class ThemeId {
    private constructor(public readonly value: string) {
        if (!isValidUUID(value)) {
            throw new DomainException("ThemeId must be a valid UUID v4.");
        }
    }
    public static of(value: string): ThemeId {
        if (value.includes('/')) {
            const parts = value.split('/');
            const uuid = parts.pop();
            if (uuid && isValidUUID(uuid)) {
                return new ThemeId(uuid);
            }
        }
        return new ThemeId(value);
    }
    public static generate(): ThemeId {
        return new ThemeId(randomUUID());
    }
}

// --- VOs de Contenido ---
export class QuizTitle {
    private constructor(public readonly value: string) {
        if (value.length < 1 || value.length > 95) {
            throw new DomainException("QuizTitle must be between 1 and 95 characters.");
        }
    }
    public static of(value: string | null): QuizTitle | null {
        return value === null ? null : new QuizTitle(value);
    }
}

export class QuizDescription {
    private constructor(public readonly value: string) {
        if (value.length > 500) { 
            throw new DomainException("QuizDescription cannot be longer than 500 characters.");
        }
    }
    public static of(value: string | null): QuizDescription | null {
        return value === null ? null : new QuizDescription(value);
    }
}

export class QuizStatus {
    private constructor(public readonly value: 'draft' | 'published') {}

    public static fromString(value: string): QuizStatus {
        if (value !== 'draft' && value !== 'published') {
            throw new DomainException(`Invalid QuizStatus, it must be 'draft' or 'published'.`);
        }
        return new QuizStatus(value as 'draft' | 'published');
    }
}

export class QuizCategory {
    private constructor(public readonly value: string) {
        if (value.length < 3 || value.length > 50) {
            throw new DomainException("QuizCategory must be between 3 and 50 characters.");
        }
    }
    public static of(value: string | null): QuizCategory | null {
        return value === null ? null : new QuizCategory(value);
    }
}

export class MediaUrl {
    private constructor(public readonly value: string | null) {
        if (value) {
            try {
                new URL(value);
            } catch (_) {
                throw new DomainException(`Invalid URL format for MediaUrl: ${value}`);
            }
        }
    }
    public static of(value: string | null): MediaUrl {
        return new MediaUrl(value);
    }
}


// --- VOs de Estado ---
type VisibilityValue = 'public' | 'private';
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
            throw new DomainException("Visibility must be 'public' or 'private'.");
        }
        return new Visibility(value as VisibilityValue);
    }
}
