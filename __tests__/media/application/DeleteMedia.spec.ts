
import { DeleteMedia } from '../../../src/lib/media/application/DeleteMedia';
import { MediaRepository } from '../../../src/lib/media/domain/port/MediaRepository';
import { Media } from '../../../src/lib/media/domain/entity/Media';
import { MediaId } from '../../../src/lib/media/domain/valueObject/Media';
import { Result } from '../../../src/common/domain/result';
import { DomainException } from '../../../src/common/domain/domain.exception';

// Minimal Media entity mock for repository stub
const dummyMedia = { id: MediaId.of('existent-media-uuid') } as Media;

describe('DeleteMedia Use Case (Application Layer)', () => {
    let mediaRepositoryStub: MediaRepository;

    beforeEach(() => {
        // STUB the repository
        mediaRepositoryStub = {
            findById: jest.fn().mockResolvedValue(dummyMedia), // By default, assume media exists
            delete: jest.fn().mockResolvedValue(undefined),   // Assume delete is successful
            save: jest.fn(), // Not used
        };
    });

    it('should return a SUCCESS Result when media is successfully deleted', async () => {
        // ARRANGE
        const mediaId = 'existent-media-uuid';
        const useCase = new DeleteMedia(mediaRepositoryStub);

        // ACT
        const result = await useCase.execute(mediaId);

        // ASSERT
        // a. Check for success
        expect(result.isSuccess).toBe(true);

        // b. Verify collaborators were called correctly (Interaction Testing)
        expect(mediaRepositoryStub.findById).toHaveBeenCalledWith(MediaId.of(mediaId));
        expect(mediaRepositoryStub.delete).toHaveBeenCalledWith(MediaId.of(mediaId));
    });

    it('should THROW a DomainException if the media to delete is not found', async () => {
        // ARRANGE
        const nonExistentMediaId = 'non-existent-media-uuid';
        // Sabotage the stub to simulate media not being found
        (mediaRepositoryStub.findById as jest.Mock).mockResolvedValue(null);
        const useCase = new DeleteMedia(mediaRepositoryStub);

        // ACT & ASSERT
        await expect(useCase.execute(nonExistentMediaId)).rejects.toThrow(DomainException);
        await expect(useCase.execute(nonExistentMediaId)).rejects.toThrow('Media not found');
        
        // Ensure we do not attempt to delete if it was never found
        expect(mediaRepositoryStub.delete).not.toHaveBeenCalled();
    });

    it('should let a DomainException from an invalid ID format bubble up', async () => {
        // ARRANGE
        const invalidId = 'not-a-uuid';
        const useCase = new DeleteMedia(mediaRepositoryStub);

        // ACT & ASSERT
        await expect(useCase.execute(invalidId)).rejects.toThrow(DomainException);
        
        // Ensure no repository methods were called
        expect(mediaRepositoryStub.findById).not.toHaveBeenCalled();
        expect(mediaRepositoryStub.delete).not.toHaveBeenCalled();
    });
});
