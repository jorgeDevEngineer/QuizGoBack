
import { GetQuizUseCase } from '../../../src/lib/kahoot/application/GetQuizUseCase';
import { QuizRepository } from '../../../src/lib/kahoot/domain/port/QuizRepository';
import { Quiz } from '../../../src/lib/kahoot/domain/entity/Quiz';
import { DomainException } from '../../../src/common/domain/domain.exception';
import { QuizId } from '../../../src/lib/kahoot/domain/valueObject/Quiz';

// A helper to create a realistic, non-mocked entity for stubbing.
const createDummyQuiz = (id: string): Quiz => {
    const quizId = QuizId.of(id);
    // We only need the properties that are relevant for the test assertions.
    return { 
        id: quizId,
        toPlainObject: () => ({ id: quizId.value })
    } as unknown as Quiz;
}

describe('GetQuizUseCase (Application Layer)', () => {
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

    it('should return the correct quiz when one is found', async () => {
        // ARRANGE
        const quizId = '123e4567-e89b-42d3-a456-426614174001';
        const dummyQuiz = createDummyQuiz(quizId);
        // Configure the stub to return our dummy quiz.
        quizRepositoryStub.find.mockResolvedValue(dummyQuiz);
        
        const useCase = new GetQuizUseCase(quizRepositoryStub);

        // ACT
        const result = await useCase.execute(quizId);

        // ASSERT (Output-Based Testing)
        expect(result.isSuccess).toBe(true);
        const returnedQuiz = result.getValue();
        expect(returnedQuiz).toBe(dummyQuiz);
        expect(returnedQuiz.id.value).toBe(quizId);
    });

    it('should fail if the quiz is not found', async () => {
        // ARRANGE
        const nonExistentQuizId = '123e4567-e89b-42d3-a456-426614174004';
        quizRepositoryStub.find.mockResolvedValue(null);

        const useCase = new GetQuizUseCase(quizRepositoryStub);

        // ACT & ASSERT (Behavior Verification)
        await expect(useCase.execute(nonExistentQuizId)).rejects.toThrow('Quiz not found');
    });

    it('should fail if the ID is not a valid UUID', async () => {
        // ARRANGE
        const invalidId = 'invalid-uuid';
        const useCase = new GetQuizUseCase(quizRepositoryStub);

        // ACT & ASSERT
        await expect(useCase.execute(invalidId)).rejects.toThrow(DomainException);
    });
});
