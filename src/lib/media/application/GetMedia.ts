import { MediaRepository } from '../domain/port/MediaRepository';
import { Media } from '../domain/entity/Media';
import { MediaId } from '../domain/valueObject/Media';

export class GetMedia {
  constructor(private readonly mediaRepository: MediaRepository) {}

  async run(id: string): Promise<{ media: Media; file: Buffer }> {
    const mediaId = MediaId.of(id);
    const media = await this.mediaRepository.findById(mediaId);
    if (!media) {
      throw new Error('Media not found');
    }
    return { media, file: media.properties().data };
  }
}
