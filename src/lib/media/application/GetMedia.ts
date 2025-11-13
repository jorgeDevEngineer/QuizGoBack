import { MediaId } from '../domain/valueObject/Media';
import { MediaRepository } from '../domain/port/MediaRepository';
import { StorageProvider } from '../domain/port/StorageProvider';
import { Media } from '../domain/entity/Media';

// DTO de respuesta: Devuelve la data de la entidad + el binario
export interface GetMediaResponse {
  media: Media;
  file: Buffer;
}

export class GetMedia {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly storageProvider: StorageProvider
  ) {}

  async run(id: string): Promise<GetMediaResponse> {
    const mediaId = MediaId.of(id);

    // 1. Buscar Metadatos en BD
    const media = await this.mediaRepository.findById(mediaId);

    if (!media) {
      throw new Error(`Media with id <${id}> not found`);
    }

    // 2. Buscar Binario en Storage usando el path de la entidad
    // Aquí es donde brilla el ValueObject 'path'
    const fileBuffer = await this.storageProvider.get(media.path.value);

    return {
      media,
      file: fileBuffer
    };
  }
}