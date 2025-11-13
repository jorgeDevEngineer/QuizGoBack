import { MediaId, MimeType, FileSize, StoragePath } from '../valueObject/Media';

export class Media {
  readonly id: MediaId;
  readonly path: StoragePath;
  readonly mimeType: MimeType;
  readonly size: FileSize;
  readonly originalName: string;
  readonly createdAt: Date;

  // Constructor privado: obliga a usar el método estático 'create'
  private constructor(
    id: MediaId,
    path: StoragePath,
    mimeType: MimeType,
    size: FileSize,
    originalName: string,
    createdAt: Date
  ) {
    this.id = id;
    this.path = path;
    this.mimeType = mimeType;
    this.size = size;
    this.originalName = originalName;
    this.createdAt = createdAt;
  }

  // Factory Method: El único punto de entrada para crear una nueva entidad válida
  static create(
    path: string,
    mimeType: string,
    size: number,
    originalName: string,
    id?: string // Opcional, por si estamos reconstituyendo desde BD
  ): Media {
    const mediaId = id ? MediaId.of(id) : MediaId.generate();
    return new Media(
      mediaId,
      new StoragePath(path),
      new MimeType(mimeType),
      new FileSize(size),
      originalName,
      new Date()
    );
  }

  // Reconstituye una entidad Media desde datos persistidos (preserva createdAt)
  static reconstitute(
    id: string,
    path: string,
    mimeType: string,
    size: number,
    originalName: string,
    createdAt: Date
  ): Media {
    return new Media(
      MediaId.of(id),
      new StoragePath(path),
      new MimeType(mimeType),
      new FileSize(size),
      originalName,
      createdAt
    );
  }

  // Ejemplo de comportamiento de dominio futuro:
  // moveTo(newPath: string) { ... }
}