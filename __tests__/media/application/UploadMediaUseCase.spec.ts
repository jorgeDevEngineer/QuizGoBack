
import { UploadMediaUseCase, UploadMediaDto } from '../../../src/lib/media/application/UploadMedia';
import { MediaRepository } from '../../../src/lib/media/domain/port/MediaRepository';
import { IMediaStorageService } from '../../../src/lib/media/domain/port/IMediaStorageService';
import { ILoggerPort } from '../../../src/lib/aspects/logger/domain/ports/logger.port';
import { Media } from '../../../src/lib/media/domain/entity/Media';
import { Result } from '../../../src/common/domain/result';
import { MediaUrl } from '../../../src/lib/media/domain/valueObject/Media';

describe('UploadMediaUseCase (Application Layer)', () => {
  let mediaRepositoryStub: MediaRepository;
  let storageServiceStub: IMediaStorageService;
  let loggerMock: ILoggerPort;

  const fileBuffer = Buffer.from('fake-image-data');

  const createValidDto = (): UploadMediaDto => ({
    userId: 'user-uuid-1',
    fileName: 'test-image.png',
    mimeType: 'image/png',
    buffer: fileBuffer,
  });

  beforeEach(() => {
    // 1. STUB the Repository (Managed Dependency)
    mediaRepositoryStub = {
      findById: jest.fn(),
      save: jest.fn().mockImplementation((media: Media) => Promise.resolve(media)),
    };

    // 2. STUB the Storage Service (Managed Dependency)
    storageServiceStub = {
      upload: jest.fn().mockResolvedValue(new MediaUrl('https://s3.aws.com/fake-bucket/test-image.png')),
    };

    // 3. MOCK the Logger (Ambient/External Dependency)
    loggerMock = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };
  });

  it('should return a SUCCESS Result with a Media entity for a valid upload', async () => {
    // ARRANGE
    const useCase = new UploadMediaUseCase(mediaRepositoryStub, storageServiceStub);
    const validDto = createValidDto();

    // ACT
    const result = await useCase.execute(validDto);

    // ASSERT (State-Based Testing)
    // a. Check for success
    expect(result.isSuccess).toBe(true);
    
    // b. Check the output value
    const returnedMedia = result.getValue();
    expect(returnedMedia).toBeInstanceOf(Media);
    expect(returnedMedia.toPlainObject().url).toBe('https://s3.aws.com/fake-bucket/test-image.png');
    expect(returnedMedia.toPlainObject().mimeType).toBe('image/png');
    
    // c. (Forbidden) Do not verify calls to stubs
    // expect(storageServiceStub.upload).toHaveBeenCalled();
    // expect(mediaRepositoryStub.save).toHaveBeenCalled();
  });

  it('should return a FAILURE Result if the storage service fails', async () => {
    // ARRANGE
    // Sabotage the stub to simulate an external failure
    storageServiceStub.upload = jest.fn().mockRejectedValue(new Error('S3 Bucket is on fire'));
    const useCase = new UploadMediaUseCase(mediaRepositoryStub, storageServiceStub);
    const validDto = createValidDto();

    // ACT
    const result = await useCase.execute(validDto);

    // ASSERT
    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('S3 Bucket is on fire');
    // Verify NO attempt was made to save to the DB if the upload failed
    expect(mediaRepositoryStub.save).not.toHaveBeenCalled(); 
  });
  
  it('should return a FAILURE Result if a domain invariant is broken', async () => {
    // ARRANGE: Pass an unsupported MIME type to trigger a DomainException
    const useCase = new UploadMediaUseCase(mediaRepositoryStub, storageServiceStub);
    const invalidDto: UploadMediaDto = {
      ...createValidDto(),
      mimeType: 'application/x-zip-compressed',
    };
    
    // ACT
    const result = await useCase.execute(invalidDto);
    
    // ASSERT
    expect(result.isFailure).toBe(true);
    expect(result.error).toBe('Unsupported MIME type.');
    expect(storageServiceStub.upload).not.toHaveBeenCalled();
    expect(mediaRepositoryStub.save).not.toHaveBeenCalled();
  });
});
