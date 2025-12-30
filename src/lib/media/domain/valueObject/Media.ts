import { randomUUID } from 'crypto';
import { DomainException } from '../../../shared/exceptions/domain.exception';

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isValidUUID(value: string): boolean {
  return UUID_V4_REGEX.test(value);
}

export class MediaId {
  readonly value: string;

  private constructor(value: string) {
    if (!isValidUUID(value)) {
      throw new DomainException(`MediaId does not have a valid UUID v4 format: ${value}`);
    }
    this.value = value;
  }

  static generate(): MediaId {
    return new MediaId(randomUUID());
  }

  static of(value: string): MediaId {
    if (value.includes('/')) {
      const parts = value.split('/');
      const uuid = parts.pop();
      if (uuid && isValidUUID(uuid)) {
        return new MediaId(uuid);
      }
    }
    return new MediaId(value);
  }
  public getValue():string {
    return this.value;
  }
}

const SUPPORTED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/quicktime', // .mov
];

export class MimeType {
  readonly value: string;

  constructor(value: string) {
    if (!value || !value.includes('/')) {
        throw new DomainException(`Invalid MimeType format: ${value}`);
    }
    if (!SUPPORTED_MIME_TYPES.includes(value)) {
        throw new DomainException(`Unsupported MIME type: ${value}`);
    }
    this.value = value;
  }
}

export class FileSize {
  readonly value: number;

  constructor(value: number) {
    if (value <= 0) {
      throw new DomainException('File size must be a positive number');
    }
    // 100 MB limit
    if (value > 100 * 1024 * 1024) { 
        throw new DomainException('File size cannot exceed 100MB');
    }
    this.value = value;
  }
}
