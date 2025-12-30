
import { GetMedia, GetMediaResponse } from '../../../src/lib/media/application/GetMedia';
import { MediaRepository } from '../../../src/lib/media/domain/port/MediaRepository';
import { Media } from '../../../src/lib/media/domain/entity/Media';
import { MediaId } from '../../../src/lib/media/domain/valueObject/Media';
import { Result } from '../../../src/lib/shared/Type Helpers/result';
import { DomainException } from '../../../src/lib/shared/exceptions/domain.exception';

// Helper to create a dummy Media object for stubbing
const createDummyMedia = (id: string): Media => {
    const mediaId = MediaId.of(id);
    const fileBuffer = Buffer.from('fake-file-data');
    // Mock just enough of the entity for the use case to function
    return {
        id: mediaId,
        properties: () => ({
            data: fileBuffer,
            // other properties are not needed for this test
        }),
    } as unknown as Media;
};

describe('GetMedia Use Case (Application Layer)', () => {
    let mediaRepositoryStub: jest.Mocked<MediaRepository>;

    beforeEach(() => {
        // STUB the repository with all its methods
        mediaRepositoryStub = {
            findById: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            findAll: jest.fn(),
        };
    });

    it('should return a SUCCESS Result with Media and Buffer when found', async () => {
        // ARRANGE
        const mediaId = '123e4567-e89b-42d3-a456-426614174001'; // Valid UUID
        const dummyMedia = createDummyMedia(mediaId);
        mediaRepositoryStub.findById.mockResolvedValue(dummyMedia);

        const useCase = new GetMedia(mediaRepositoryStub);

        // ACT
        const result = await useCase.execute(mediaId);

        // ASSERT (State-Based Testing)
        // a. Verify success
        expect(result.isSuccess).toBe(true);
        
        // b. Verify the payload
        const { media, file } = result.getValue();
        expect(media).toBe(dummyMedia);
        expect(file).toBeInstanceOf(Buffer);
        expect(file.toString()).toBe('fake-file-data');
        
        // c. Verify collaborator was called correctly
        expect(mediaRepositoryStub.findById).toHaveBeenCalledWith(MediaId.of(mediaId));
    });

    it('should THROW a DomainException if the media is not found', async () => {
        // ARRANGE
        const nonExistentMediaId = '123e4567-e89b-42d3-a456-426614174002'; // Valid UUID
        // Configure stub to simulate not finding the media
        mediaRepositoryStub.findById.mockResolvedValue(null);

        const useCase = new GetMedia(mediaRepositoryStub);

        // ACT & ASSERT
        // The async execute method should reject with the exception
        await expect(useCase.execute(nonExistentMediaId)).rejects.toThrow(DomainException);
        await expect(useCase.execute(nonExistentMediaId)).rejects.toThrow('Media not found');
    });

    it('should let a DomainException from an invalid ID bubble up', async () => {
        // ARRANGE
        const invalidId = 'not-a-uuid'; // This will fail MediaId.of validation
        const useCase = new GetMedia(mediaRepositoryStub);

        // ACT & ASSERT
        await expect(useCase.execute(invalidId)).rejects.toThrow(DomainException);
        
        // Ensure we didn't even try to call the repository
        expect(mediaRepositoryStub.findById).not.toHaveBeenCalled();
    });
});
