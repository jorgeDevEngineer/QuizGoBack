
import { MediaRepository } from '../domain/port/MediaRepository';
import { MediaId } from '../domain/valueObject/Media';
import { Result } from '../../shared/Type Helpers/result';
import { DomainException } from '../../shared/exceptions/domain.exception';
import { IHandler } from 'src/lib/shared/IHandler';

export class DeleteMedia implements IHandler<string, Result<void>> {
  constructor(private readonly mediaRepository: MediaRepository) {}

  async execute(id: string): Promise<Result<void>> {
    // Create a Value Object from the ID. Can throw a DomainException for invalid format.
    const mediaId = MediaId.of(id);

    // Verify the media exists before attempting to delete.
    const media = await this.mediaRepository.findById(mediaId);

    // If not found, throw a domain exception, leading to a 404 response.
    if (!media) {
      throw new DomainException('Media not found');
    }

    // Attempt to delete. Infrastructure errors will bubble up to the decorator.
    await this.mediaRepository.delete(mediaId);
    
    return Result.ok<void>();
  }
}
