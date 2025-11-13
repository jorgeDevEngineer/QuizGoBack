import { Media } from '../domain/entity/Media';
import { MediaRepository } from '../domain/port/MediaRepository';
import { StorageProvider } from '../domain/port/StorageProvider';

// DTO (Data Transfer Object) para no ensuciar con tipos de infraestructura
export interface UploadMediaDTO {
  file: Buffer;
  fileName: string;
  mimeType: string;
  size: number;
}

export class UploadMedia {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly storageProvider: StorageProvider
  ) {}

  async run(request: UploadMediaDTO): Promise<Media> {
    // 1. Guardar Físicamente (Storage)
    const storagePath = await this.storageProvider.upload(
      request.file,
      request.fileName,
      request.mimeType
    );

    // 2. Crear Entidad de Dominio
    const media = Media.create(
      storagePath,
      request.mimeType,
      request.size,
      request.fileName
    );

    // 3. Guardar Metadatos (Base de Datos)
    await this.mediaRepository.save(media);

    return media;
  }
}