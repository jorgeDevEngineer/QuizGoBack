import { Media } from '../domain/entity/Media';
import { MediaRepository } from '../domain/port/MediaRepository';

// DTO (Data Transfer Object) para no ensuciar con tipos de infraestructura
export interface UploadMediaDTO {
  file: Buffer;
  fileName: string;
  mimeType: string;
  size: number;
}

export class UploadMedia {
  constructor(private readonly mediaRepository: MediaRepository) {}

  async run(request: UploadMediaDTO): Promise<Media> {
    // 1. Crear Entidad de Dominio
    const media = Media.create(
      request.file,
      request.mimeType,
      request.size,
      request.fileName
    );

    // 2. Guardar en la Base de Datos
    await this.mediaRepository.save(media);

    return media;
  }
}
