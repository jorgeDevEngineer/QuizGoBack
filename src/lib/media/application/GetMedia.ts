
import { MediaRepository } from '../domain/port/MediaRepository';
import { Media } from '../domain/entity/Media';
import { MediaId } from '../domain/valueObject/Media';
import { IUseCase } from '../../../common/use-case.interface';
import { Result } from '../../../common/domain/result';
import { DomainException } from '../../../common/domain/domain.exception';

// We define the DTO for the response. In this case, it contains the entity
// and the raw file data for the controller to serve.
export type GetMediaResponse = { media: Media; file: Buffer };

export class GetMedia implements IUseCase<string, Result<GetMediaResponse>> {
  constructor(private readonly mediaRepository: MediaRepository) {}

  async execute(id: string): Promise<Result<GetMediaResponse>> {
    // Create a Value Object from the ID. This can throw a DomainException.
    const mediaId = MediaId.of(id);

    // Find the media entity. Infrastructure errors will bubble up.
    const media = await this.mediaRepository.findById(mediaId);

    // If the media is not found, we throw a domain-specific exception.
    // The decorator will catch this and format it as a 404 error.
    if (!media) {
      throw new DomainException('Media not found');
    }

    const response = { media, file: media.properties().data };
    return Result.ok<GetMediaResponse>(response);
  }
}
