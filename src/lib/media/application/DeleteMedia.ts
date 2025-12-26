
import { MediaRepository } from '../domain/port/MediaRepository';
import { MediaId } from '../domain/valueObject/Media';
import { IUseCase } from '../../../common/use-case.interface';

export class DeleteMedia implements IUseCase<string, void> {
  constructor(private readonly mediaRepository: MediaRepository) {}

  async execute(id: string): Promise<void> {
    const mediaId = MediaId.of(id);
    await this.mediaRepository.delete(mediaId);
  }
}
