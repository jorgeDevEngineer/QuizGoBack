
import { UploadMedia, UploadMediaDTO } from '../../../src/lib/media/application/UploadMedia';
import { MediaRepository } from '../../../src/lib/media/domain/port/MediaRepository';
import { ImageOptimizer } from '../../../src/lib/media/domain/port/ImageOptimizer';
import { Media } from '../../../src/lib/media/domain/entity/Media';
import { Result } from '../../../src/common/domain/result';

describe('UploadMedia UseCase (Application Layer)', () => {
  let mediaRepositoryStub: jest.Mocked<MediaRepository>;
  let imageOptimizerStub: jest.Mocked<ImageOptimizer>;
  let uploadMediaUseCase: UploadMedia;

  const fileBuffer = Buffer.from('fake-image-data');

  const createValidDto = (): UploadMediaDTO => ({
    file: fileBuffer,
    fileName: 'test-image.png',
    mimeType: 'image/png',
    size: fileBuffer.length,
  });

  beforeEach(() => {
    mediaRepositoryStub = {
      findById: jest.fn(),
      save: jest.fn().mockImplementation((media: Media) => Promise.resolve(media)),
      delete: jest.fn(),
      findAll: jest.fn(),
    };

    imageOptimizerStub = {
      optimize: jest.fn().mockResolvedValue(null), // Default to no optimization
    };

    uploadMediaUseCase = new UploadMedia(mediaRepositoryStub, imageOptimizerStub);
  });

  it('should return a SUCCESS Result with a Media entity for a valid upload', async () => {
    // ARRANGE
    const validDto = createValidDto();

    // ACT
    const result = await uploadMediaUseCase.execute(validDto);

    // ASSERT
    expect(result.isSuccess).toBe(true);
    const returnedMedia = result.getValue();
    expect(returnedMedia).toBeInstanceOf(Media);
    expect(returnedMedia.properties().originalName).toBe('test-image.png');
    expect(mediaRepositoryStub.save).toHaveBeenCalledWith(returnedMedia);
  });

  it('should optimize the image if the image optimizer returns an optimized version', async () => {
    // ARRANGE
    const optimizedBuffer = Buffer.from('optimized-data');
    const thumbnailBuffer = Buffer.from('thumbnail-data');
    imageOptimizerStub.optimize.mockResolvedValue({
      buffer: optimizedBuffer,
      size: optimizedBuffer.length,
      thumbnailBuffer: thumbnailBuffer,
    });
    const validDto = createValidDto();

    // ACT
    const result = await uploadMediaUseCase.execute(validDto);

    // ASSERT
    expect(imageOptimizerStub.optimize).toHaveBeenCalledWith(fileBuffer, 'image/png');
    const returnedMedia = result.getValue();
    expect(returnedMedia.properties().data).toBe(optimizedBuffer);
    expect(returnedMedia.properties().thumbnail).toBe(thumbnailBuffer);
    expect(mediaRepositoryStub.save).toHaveBeenCalledWith(returnedMedia);
  });

  it('should return a FAILURE Result if a domain invariant is broken (e.g., invalid MIME type)', async () => {
    // ARRANGE
    const invalidDto: UploadMediaDTO = {
      ...createValidDto(),
      mimeType: 'application/pdf', // Invalid MIME type
    };

    // ACT & ASSERT
    await expect(uploadMediaUseCase.execute(invalidDto)).rejects.toThrow(
      'Unsupported MIME type: application/pdf'
    );
    expect(mediaRepositoryStub.save).not.toHaveBeenCalled();
  });

  it('should allow repository errors to bubble up', async () => {
    // ARRANGE
    mediaRepositoryStub.save.mockRejectedValue(new Error('Database error'));
    const validDto = createValidDto();

    // ACT & ASSERT
    await expect(uploadMediaUseCase.execute(validDto)).rejects.toThrow('Database error');
  });
});
