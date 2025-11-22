import { MediaId, MimeType, FileSize } from '../valueObject/Media';

export class Media {
  readonly id: MediaId;
  readonly data: Buffer;
  readonly mimeType: MimeType;
  readonly size: FileSize;
  readonly originalName: string;
  readonly createdAt: Date;

  // Constructor privado: obliga a usar el método estático 'create'
  private constructor(
    id: MediaId,
    data: Buffer,
    mimeType: MimeType,
    size: FileSize,
    originalName: string,
    createdAt: Date
  ) {
    this.id = id;
    this.data = data;
    this.mimeType = mimeType;
    this.size = size;
    this.originalName = originalName;
    this.createdAt = createdAt;
  }

  // Factory Method: El único punto de entrada para crear una nueva entidad válida
  static create(
    data: Buffer,
    mimeType: string,
    size: number,
    originalName: string,
    id?: string // Opcional, por si estamos reconstituyendo desde BD
  ): Media {
    const mediaId = id ? MediaId.of(id) : MediaId.generate();
    return new Media(
      mediaId,
      data,
      new MimeType(mimeType),
      new FileSize(size),
      originalName,
      new Date()
    );
  }

  // Reconstituye una entidad Media desde datos persistidos (preserva createdAt)
  static fromPrimitives(primitives: {
    id: string;
    data: Buffer;
    mimeType: string;
    size: number;
    originalName: string;
    createdAt: Date;
  }): Media {
    return new Media(
      MediaId.of(primitives.id),
      primitives.data,
      new MimeType(primitives.mimeType),
      new FileSize(primitives.size),
      primitives.originalName,
      primitives.createdAt
    );
  }

  properties() {
    return {
      id: this.id.value,
      data: this.data,
      mimeType: this.mimeType.value,
      size: this.size.value,
      originalName: this.originalName,
      createdAt: this.createdAt,
    };
  }
}
