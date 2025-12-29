
import { DeleteMedia } from '../../../src/lib/media/application/DeleteMedia';
import { MediaRepository } from '../../../src/lib/media/domain/port/MediaRepository';
import { Media } from '../../../src/lib/media/domain/entity/Media';
import { MediaId } from '../../../src/lib/media/domain/valueObject/Media';
import { Result } from '../../../src/common/domain/result';
import { DomainException } from '../../../src/common/domain/domain.exception';

const validMediaId = '123e4567-e89b-42d3-a456-426614174003';
const dummyMedia = { id: MediaId.of(validMediaId) } as jest.Mocked<Media>;

describe('DeleteMedia Use Case (Application Layer)', () => {
    let mediaRepositoryStub: jest.Mocked<MediaRepository>;

    beforeEach(() => {
        mediaRepositoryStub = {
            findById: jest.fn().mockResolvedValue(dummyMedia),
            delete: jest.fn().mockResolvedValue(undefined),
            save: jest.fn(),
            findAll: jest.fn(), // Added missing method
        };
    });

    it('should return a SUCCESS Result when media is successfully deleted', async () => {
        // ARRANGE
        const useCase = new DeleteMedia(mediaRepositoryStub);

        // ACT
        const result = await useCase.execute(validMediaId);

        // ASSERT
        expect(result.isSuccess).toBe(true);
        expect(mediaRepositoryStub.findById).toHaveBeenCalledWith(MediaId.of(validMediaId));
        expect(mediaRepositoryStub.delete).toHaveBeenCalledWith(MediaId.of(validMediaId));
    });

    it('should THROW a DomainException if the media to delete is not found', async () => {
        // ARRANGE
        const nonExistentMediaId = '123e4567-e89b-42d3-a456-426614174004'; // Valid UUID
        mediaRepositoryStub.findById.mockResolvedValue(null);
        const useCase = new DeleteMedia(mediaRepositoryStub);

        // ACT & ASSERT
        await expect(useCase.execute(nonExistentMediaId)).rejects.toThrow(DomainException);
        await expect(useCase.execute(nonExistentMediaId)).rejects.toThrow('Media not found');
        expect(mediaRepositoryStub.delete).not.toHaveBeenCalled();
    });

    it('should let a DomainException from an invalid ID format bubble up', async () => {
        // ARRANGE
        const invalidId = 'not-a-uuid';
        const useCase = new DeleteMedia(mediaRepositoryStub);

        // ACT & ASSERT
        await expect(useCase.execute(invalidId)).rejects.toThrow(DomainException);
        expect(mediaRepositoryStub.findById).not.toHaveBeenCalled();
        expect(mediaRepositoryStub.delete).not.toHaveBeenCalled();
    });
});
