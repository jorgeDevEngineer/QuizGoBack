import { Media } from '../domain/entity/Media';
import { MediaRepository } from '../domain/port/MediaRepository';
import { ImageOptimizer } from '../domain/port/ImageOptimizer';

export interface UploadMediaDTO {
  file: Buffer;
  fileName: string;
  mimeType: string;
  size: number;
}

export class UploadMedia {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly imageOptimizer: ImageOptimizer,
  ) {}

  async run(request: UploadMediaDTO): Promise<Media> {
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

    const media = Media.create(
      fileBuffer,
      request.mimeType,
      fileSize,
      request.fileName,
      thumbnailBuffer,
    );

    await this.mediaRepository.save(media);

    return media;
  }
}
