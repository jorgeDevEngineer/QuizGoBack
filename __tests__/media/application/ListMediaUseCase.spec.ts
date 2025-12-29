
import { ListMediaUseCase, ListMediaResponseDTO } from '../../../src/lib/media/application/ListMediaUseCase';
import { MediaRepository } from '../../../src/lib/media/domain/port/MediaRepository';
import { Media } from '../../../src/lib/media/domain/entity/Media';
import { Result } from '../../../src/lib/shared/Type Helpers/result';

// Mock implementation for a Media entity
const createMockMedia = (id: string): Media => {
    const mockResponse = {
        id: id,
        url: `https://cdn.example.com/images/${id}`,
        mimeType: 'image/jpeg',
        size: 1024,
        originalName: `image-${id}.jpg`,
        createdAt: new Date(),
        thumbnailUrl: `https://cdn.example.com/thumbnails/${id}`,
    };
    return { 
        // The only method the use case uses is `toListResponse`
        toListResponse: () => mockResponse 
    } as unknown as Media;
};

describe('ListMediaUseCase (Application Layer)', () => {
    let mediaRepositoryStub: MediaRepository;

    beforeEach(() => {
        // STUB the repository to control its output
        mediaRepositoryStub = {
            findAll: jest.fn(),
            // Other methods are not used in this use case
            findById: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
        };
    });

    it('should return a SUCCESS Result with a list of media DTOs', async () => {
        // ARRANGE
        const mockMediaList = [createMockMedia('uuid-1'), createMockMedia('uuid-2')];
        (mediaRepositoryStub.findAll as jest.Mock).mockResolvedValue(mockMediaList);

        const useCase = new ListMediaUseCase(mediaRepositoryStub);

        // ACT
        const result = await useCase.execute();

        // ASSERT
        // a. Check for success
        expect(result.isSuccess).toBe(true);

        // b. Verify the payload is correct
        const responseDto = result.getValue();
        expect(responseDto).toHaveLength(2);
        expect(responseDto[0].id).toBe('uuid-1');
        expect(responseDto[1].id).toBe('uuid-2');
        expect(responseDto[0].url).toContain('uuid-1');
        
        // c. Verify the collaborator was called
        expect(mediaRepositoryStub.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return a SUCCESS Result with an empty list if no media exists', async () => {
        // ARRANGE
        // Configure stub to return an empty array
        (mediaRepositoryStub.findAll as jest.Mock).mockResolvedValue([]);
        
        const useCase = new ListMediaUseCase(mediaRepositoryStub);

        // ACT
        const result = await useCase.execute();

        // ASSERT
        expect(result.isSuccess).toBe(true);
        expect(result.getValue()).toEqual([]);
        expect(mediaRepositoryStub.findAll).toHaveBeenCalledTimes(1);
    });
});
