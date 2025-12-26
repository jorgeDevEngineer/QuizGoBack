
import { UploadMedia, UploadMediaDTO } from '../../../src/lib/media/application/UploadMedia';
import { MediaRepository } from '../../../src/lib/media/domain/port/MediaRepository';
import { ImageOptimizer } from '../../../src/lib/media/domain/port/ImageOptimizer';
import { Media } from '../../../src/lib/media/domain/entity/Media';
import { Result } from '../../../src/common/domain/result';
import { DomainException } from '../../../src/common/domain/domain.exception';

const createUploadDto = (overrides: Partial<UploadMediaDTO> = {}): UploadMediaDTO => {
    return {
        file: Buffer.from('original-file'),
        fileName: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 1000,
        ...overrides,
    };
};

describe('UploadMedia Use Case (Application Layer)', () => {
    let mediaRepositoryStub: MediaRepository;
    let imageOptimizerStub: ImageOptimizer;

    beforeEach(() => {
        // STUB repository
        mediaRepositoryStub = {
            save: jest.fn().mockResolvedValue(undefined),
            findById: jest.fn(),
            delete: jest.fn(),
            findAll: jest.fn(),
        };
        // STUB image optimizer
        imageOptimizerStub = {
            optimize: jest.fn(),
        };
    });

    it('should save an OPTIMIZED image and thumbnail when optimization succeeds', async () => {
        // ARRANGE
        const originalDto = createUploadDto();
        const optimizedBuffer = Buffer.from('optimized-file');
        const thumbnailBuffer = Buffer.from('thumbnail');

        (imageOptimizerStub.optimize as jest.Mock).mockResolvedValue({
            buffer: optimizedBuffer,
            size: 500,
            thumbnailBuffer: thumbnailBuffer,
        });

        const useCase = new UploadMedia(mediaRepositoryStub, imageOptimizerStub);

        // ACT
        const result = await useCase.execute(originalDto);

        // ASSERT
        // a. Verify success
        expect(result.isSuccess).toBe(true);

        // b. Verify collaborators
        expect(imageOptimizerStub.optimize).toHaveBeenCalledWith(originalDto.file, originalDto.mimeType);
        expect(mediaRepositoryStub.save).toHaveBeenCalledTimes(1);

        // c. Inspect the Media object that was saved
        const savedMedia = (mediaRepositoryStub.save as jest.Mock).mock.calls[0][0] as Media;
        const props = savedMedia.properties();
        expect(props.data).toBe(optimizedBuffer);
        expect(props.size.value).toBe(500);
        expect(props.thumbnail).toBe(thumbnailBuffer);
    });

    it('should save the ORIGINAL image when optimization is not performed (optimizer returns null)', async () => {
        // ARRANGE
        const originalDto = createUploadDto({ mimeType: 'application/pdf' });
        // Optimizer returns null for non-image mimetypes
        (imageOptimizerStub.optimize as jest.Mock).mockResolvedValue(null);

        const useCase = new UploadMedia(mediaRepositoryStub, imageOptimizerStub);

        // ACT
        const result = await useCase.execute(originalDto);

        // ASSERT
        expect(result.isSuccess).toBe(true);
        expect(imageOptimizerStub.optimize).toHaveBeenCalledWith(originalDto.file, originalDto.mimeType);
        expect(mediaRepositoryStub.save).toHaveBeenCalledTimes(1);

        // Inspect the saved media - it should have original properties
        const savedMedia = (mediaRepositoryStub.save as jest.Mock).mock.calls[0][0] as Media;
        const props = savedMedia.properties();
        expect(props.data).toBe(originalDto.file);
        expect(props.size.value).toBe(originalDto.size);
        expect(props.thumbnail).toBeNull();
    });

    it('should let a DomainException from Media creation bubble up', async () => {
        // ARRANGE
        // Using an invalid mimetype to trigger an error inside Media.create()
        const invalidDto = createUploadDto({ mimeType: 'invalid-mimetype' });
        (imageOptimizerStub.optimize as jest.Mock).mockResolvedValue(null);

        const useCase = new UploadMedia(mediaRepositoryStub, imageOptimizerStub);

        // ACT & ASSERT
        await expect(useCase.execute(invalidDto)).rejects.toThrow(DomainException);
        // Ensure we did not try to save if creation failed
        expect(mediaRepositoryStub.save).not.toHaveBeenCalled();
    });
});
