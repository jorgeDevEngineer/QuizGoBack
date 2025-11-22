import { MediaRepository } from '../domain/port/MediaRepository';
import { MediaId } from '../domain/valueObject/Media';

export class DeleteMedia {
  constructor(private readonly mediaRepository: MediaRepository) {}

  async run(id: string): Promise<void> {
    const mediaId = MediaId.of(id);
    await this.mediaRepository.delete(mediaId);
  }
}
