
import { MediaRepository } from '../domain/port/MediaRepository';
import { IUseCase } from '../../../common/use-case.interface';
import { Result } from '../../../common/domain/result';
import { Media } from '../domain/entity/Media';

// We define the DTO for the response of the use case.
// This prevents leaking domain entities to the presentation layer.
export type ListMediaResponseDTO = {
  id: string;
  url: string;
  mimeType: string;
  size: number;
  originalName: string;
  createdAt: Date;
  thumbnailUrl: string | null;
}[];


export class ListMediaUseCase implements IUseCase<void, Result<ListMediaResponseDTO>> {
  constructor(private readonly mediaRepository: MediaRepository) {}

  async execute(): Promise<Result<ListMediaResponseDTO>> {
    // Infrastructure errors (e.g., database connection) will bubble up to the decorator.
    const mediaList: Media[] = await this.mediaRepository.findAll();

    // Map entities to a DTO. This is a pure data transformation and should not fail.
    const response: ListMediaResponseDTO = mediaList.map(media => media.toListResponse());

    // Return a success result with the DTO.
    return Result.ok<ListMediaResponseDTO>(response);
  }
}
