import { MediaId } from '../domain/valueObject/Media';
import { MediaRepository } from '../domain/port/MediaRepository';
import { StorageProvider } from '../domain/port/StorageProvider';

export class DeleteMedia {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly storageProvider: StorageProvider
  ) {}

  async run(id: string): Promise<void> {
    const mediaId = MediaId.of(id);

    // 1. Recuperar la entidad para saber su Path
    const media = await this.mediaRepository.findById(mediaId);

    if (!media) {
      // Si no existe, podemos lanzar error o simplemente retornar (idempotencia)
      return; 
    }

    // 2. Borrar archivo físico
    await this.storageProvider.delete(media.path.value);

    // 3. Borrar registro de base de datos
    await this.mediaRepository.delete(mediaId);
  }
}