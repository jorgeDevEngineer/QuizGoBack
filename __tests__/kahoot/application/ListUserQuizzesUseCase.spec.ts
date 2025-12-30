
import { ListUserQuizzesUseCase } from '../../../src/lib/kahoot/application/ListUserQuizzesUseCase';
import { QuizRepository } from '../../../src/lib/kahoot/domain/port/QuizRepository';
import { Quiz } from '../../../src/lib/kahoot/domain/entity/Quiz';
import { DomainException } from '../../../src/lib/shared/exceptions/domain.exception';
// Correcting the import path for UserId
import { UserId } from '../../../src/lib/user/domain/valueObject/UserId';

// A helper to create realistic, non-mocked entities for stubbing.
const createDummyQuiz = (id: string, authorId: string): Partial<Quiz> => ({
    // Let TypeScript infer the return type, as we are not exporting QuizPlain
    toPlainObject: () => ({
        id,
        authorId,
        title: `Quiz ${id}`,
        description: 'A description',
        visibility: 'public',
        status: 'draft',
        category: 'General',
        themeId: 'theme-1',
        coverImageId: null,
        createdAt: new Date(),
        playCount: 0,
        questions: []
    })
});

describe('ListUserQuizzesUseCase (Application Layer)', () => {
    let quizRepositoryStub: jest.Mocked<QuizRepository>;

    beforeEach(() => {
        // ARRANGE
        quizRepositoryStub = {
            find: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            searchByAuthor: jest.fn(),
        };
    });

    it('should return a list of quizzes belonging to the specified author', async () => {
        // ARRANGE
        const authorId = '123e4567-e89b-42d3-a456-426614174001';
        const dummyQuizzes = [
            createDummyQuiz('quiz-1', authorId),
            createDummyQuiz('quiz-2', authorId),
        ] as Quiz[];
        
        quizRepositoryStub.searchByAuthor.mockResolvedValue(dummyQuizzes);
        const useCase = new ListUserQuizzesUseCase(quizRepositoryStub);

        // ACT
        const result = await useCase.execute(authorId);

        // ASSERT (Output-Based Testing)
        expect(result.isSuccess).toBe(true);
        const quizzes = result.getValue();
        expect(quizzes).toHaveLength(2);
        // Check plain object to avoid issues with partial dummy objects
        expect(quizzes[0].toPlainObject().authorId).toBe(authorId);
        expect(quizzes[1].toPlainObject().authorId).toBe(authorId);
    });

    it('should return an empty list when the author has no quizzes', async () => {
        // ARRANGE
        const authorId = '123e4567-e89b-42d3-a456-426614174002';
        quizRepositoryStub.searchByAuthor.mockResolvedValue([]); // Stub returns an empty array
        const useCase = new ListUserQuizzesUseCase(quizRepositoryStub);

        // ACT
        const result = await useCase.execute(authorId);

        // ASSERT
        expect(result.isSuccess).toBe(true);
        expect(result.getValue()).toEqual([]);
    });

    it('should fail if the author ID is not a valid UUID', async () => {
        // ARRANGE
        const invalidAuthorId = 'not-a-uuid';
        const useCase = new ListUserQuizzesUseCase(quizRepositoryStub);

        // ACT & ASSERT
        await expect(useCase.execute(invalidAuthorId)).rejects.toThrow(DomainException);
    });
});
