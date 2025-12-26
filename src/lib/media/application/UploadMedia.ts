
import { Media } from '../domain/entity/Media';
import { MediaRepository } from '../domain/port/MediaRepository';
import { ImageOptimizer } from '../domain/port/ImageOptimizer';
import { IUseCase } from '../../../common/use-case.interface';
import { Result } from '../../../common/domain/result';

export interface UploadMediaDTO {
  file: Buffer;
  fileName: string;
  mimeType: string;
  size: number;
}

export class UploadMedia implements IUseCase<UploadMediaDTO, Result<Media>> {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly imageOptimizer: ImageOptimizer,
  ) {}

  async execute(request: UploadMediaDTO): Promise<Result<Media>> {
    let fileBuffer = request.file;
    let fileSize = request.size;
    let thumbnailBuffer: Buffer | null = null;

    const optimizationResult = await this.imageOptimizer.optimize(
      request.file,
      request.mimeType,
    );

    if (optimizationResult) {
      fileBuffer = optimizationResult.buffer;
      fileSize = optimizationResult.size;
      thumbnailBuffer = optimizationResult.thumbnailBuffer;
    }

    // DomainExceptions from Media/ValueObjects will bubble up to the decorator
    const media = Media.create(
      fileBuffer,
      request.mimeType,
      fileSize,
      request.fileName,
      thumbnailBuffer,
    );

    // Infrastructure errors will bubble up to the decorator
    await this.mediaRepository.save(media);

    return Result.ok<Media>(media);
  }
}
