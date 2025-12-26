
import { ListUserQuizzesUseCase } from '../../../src/lib/kahoot/application/ListUserQuizzesUseCase';
import { QuizRepository } from '../../../src/lib/kahoot/domain/port/QuizRepository';
import { Quiz } from '../../../src/lib/kahoot/domain/entity/Quiz';
import { Result } from '../../../src/common/domain/result';
import { DomainException } from '../../../src/common/domain/domain.exception';
import { UserId, QuizId } from '../../../src/lib/kahoot/domain/valueObject/Quiz';

// Helper to create dummy quizzes for the repository stub
const createDummyQuiz = (id: string): Quiz => {
    return { id: QuizId.of(id) } as Quiz;
}

describe('ListUserQuizzesUseCase (Application Layer)', () => {
    let quizRepositoryStub: QuizRepository;

    beforeEach(() => {
        // STUB the repository
        quizRepositoryStub = {
            // The method name is `searchByAuthor` in the implementation
            searchByAuthor: jest.fn(),
            // Other methods are not used by this use case
            find: jest.fn(),
            findById: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            findAllByAuthor: jest.fn(), // Include for interface completeness if needed
        };
    });

    it('should return a SUCCESS Result with a list of quizzes for a valid author', async () => {
        // ARRANGE
        const authorId = 'author-uuid-123';
        const dummyQuizzes = [createDummyQuiz('quiz-1'), createDummyQuiz('quiz-2')];
        (quizRepositoryStub.searchByAuthor as jest.Mock).mockResolvedValue(dummyQuizzes);

        const useCase = new ListUserQuizzesUseCase(quizRepositoryStub);

        // ACT
        const result = await useCase.execute(authorId);

        // ASSERT
        // a. Check for success and correct value
        expect(result.isSuccess).toBe(true);
        const returnedQuizzes = result.getValue();
        expect(returnedQuizzes).toHaveLength(2);
        expect(returnedQuizzes).toBe(dummyQuizzes);

        // b. Verify collaborator was called correctly
        expect(quizRepositoryStub.searchByAuthor).toHaveBeenCalledWith(UserId.of(authorId));
    });

    it('should return a SUCCESS Result with an empty list if the author has no quizzes', async () => {
        // ARRANGE
        const authorId = 'author-with-no-quizzes';
        // Configure stub to return an empty array
        (quizRepositoryStub.searchByAuthor as jest.Mock).mockResolvedValue([]);

        const useCase = new ListUserQuizzesUseCase(quizRepositoryStub);

        // ACT
        const result = await useCase.execute(authorId);

        // ASSERT
        expect(result.isSuccess).toBe(true);
        expect(result.getValue()).toEqual([]);
        expect(quizRepositoryStub.searchByAuthor).toHaveBeenCalledWith(UserId.of(authorId));
    });

    it('should let a DomainException from an invalid author ID bubble up', async () => {
        // ARRANGE
        const invalidAuthorId = 'short'; // This will fail UserId.of() validation
        const useCase = new ListUserQuizzesUseCase(quizRepositoryStub);

        // ACT & ASSERT
        await expect(useCase.execute(invalidAuthorId)).rejects.toThrow(DomainException);

        // Ensure the repository was not called with an invalid ID
        expect(quizRepositoryStub.searchByAuthor).not.toHaveBeenCalled();
    });
});
