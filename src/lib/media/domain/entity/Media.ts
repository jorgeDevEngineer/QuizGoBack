import { MediaId, MimeType, FileSize } from '../valueObject/Media';

export class Media {
  readonly id: MediaId;
  readonly data: Buffer;
  readonly thumbnail: Buffer | null; // El thumbnail puede ser nulo (para no-imágenes)
  readonly mimeType: MimeType;
  readonly size: FileSize;
  readonly originalName: string;
  readonly createdAt: Date;

  // Constructor privado
  private constructor(
    id: MediaId,
    data: Buffer,
    thumbnail: Buffer | null,
    mimeType: MimeType,
    size: FileSize,
    originalName: string,
    createdAt: Date
  ) {
    this.id = id;
    this.data = data;
    this.thumbnail = thumbnail;
    this.mimeType = mimeType;
    this.size = size;
    this.originalName = originalName;
    this.createdAt = createdAt;
  }

  // Factory Method
  static create(
    data: Buffer,
    mimeType: string,
    size: number,
    originalName: string,
    thumbnail: Buffer | null, // Añadido
    id?: string
  ): Media {
    const mediaId = id ? MediaId.of(id) : MediaId.generate();
    return new Media(
      mediaId,
      data,
      thumbnail,
      new MimeType(mimeType),
      new FileSize(size),
      originalName,
      new Date()
    );
  }

  // Reconstitución desde la base de datos
  static fromPrimitives(primitives: {
    id: string;
    data: Buffer;
    thumbnail: Buffer | null;
    mimeType: string;
    size: number;
    originalName: string;
    createdAt: Date;
  }): Media {
    return new Media(
      MediaId.of(primitives.id),
      primitives.data,
      primitives.thumbnail,
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
      thumbnail: this.thumbnail,
      mimeType: this.mimeType.value,
      size: this.size.value,
      originalName: this.originalName,
      createdAt: this.createdAt,
    };
  }

  // Nuevo método para obtener solo la vista de lista (sin la imagen completa)
  toListResponse() {
    return {
      id: this.id.value,
      mimeType: this.mimeType.value,
      size: this.size.value,
      originalName: this.originalName,
      createdAt: this.createdAt,
      // Codifica el thumbnail en base64 para que sea fácil de mostrar en un <img>
      thumbnail: this.thumbnail ? `data:image/jpeg;base64,${this.thumbnail.toString('base64')}` : null,
    };
  }
}
