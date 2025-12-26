
import { GetQuizUseCase } from '../../../src/lib/kahoot/application/GetQuizUseCase';
import { QuizRepository } from '../../../src/lib/kahoot/domain/port/QuizRepository';
import { Quiz } from '../../../src/lib/kahoot/domain/entity/Quiz';
import { Result } from '../../../src/common/domain/result';
import { DomainException } from '../../../src/common/domain/domain.exception';
import { QuizId } from '../../../src/lib/kahoot/domain/valueObject/Quiz';

// Dummy Quiz object for repository stub
const createDummyQuiz = (id: string): Quiz => {
    const quizId = QuizId.of(id);
    // The full object is not needed, just enough to be recognized as a Quiz entity.
    return { 
        id: quizId,
        toPlainObject: () => ({ id: quizId.value }) 
    } as Quiz;
}

describe('GetQuizUseCase (Application Layer)', () => {
    let quizRepositoryStub: QuizRepository;

    beforeEach(() => {
        // STUB the repository
        quizRepositoryStub = {
            find: jest.fn(),
            // Other methods are not relevant for this test
            save: jest.fn(),
            delete: jest.fn(),
            findById: jest.fn(),
            findAllByAuthor: jest.fn(),
        };
    });

    it('should return a SUCCESS Result with a Quiz when the quiz is found', async () => {
        // ARRANGE
        const quizId = 'existent-quiz-uuid';
        const dummyQuiz = createDummyQuiz(quizId);
        (quizRepositoryStub.find as jest.Mock).mockResolvedValue(dummyQuiz);
        
        const useCase = new GetQuizUseCase(quizRepositoryStub);

        // ACT
        const result = await useCase.execute(quizId);

        // ASSERT (State-Based Testing)
        // a. Check for success
        expect(result.isSuccess).toBe(true);

        // b. Check the output value
        const returnedQuiz = result.getValue();
        expect(returnedQuiz).toBe(dummyQuiz);
        expect(returnedQuiz.id.value).toBe(quizId);
        
        // c. Verify the collaborator was called correctly
        expect(quizRepositoryStub.find).toHaveBeenCalledWith(QuizId.of(quizId));
    });

    it('should THROW a DomainException if the quiz is not found', async () => {
        // ARRANGE
        const nonExistentQuizId = 'non-existent-quiz-uuid';
        // Configure stub to simulate not finding the quiz
        (quizRepositoryStub.find as jest.Mock).mockResolvedValue(null);

        const useCase = new GetQuizUseCase(quizRepositoryStub);

        // ACT & ASSERT
        await expect(useCase.execute(nonExistentQuizId)).rejects.toThrow(DomainException);
        await expect(useCase.execute(nonExistentQuizId)).rejects.toThrow('Quiz not found');
    });

    it('should let a DomainException from an invalid ID bubble up', async () => {
        // ARRANGE
        const invalidId = 'invalid'; // Fails QuizId validation
        const useCase = new GetQuizUseCase(quizRepositoryStub);

        // ACT & ASSERT
        // Using rejects.toThrow for async functions
        await expect(useCase.execute(invalidId)).rejects.toThrow(DomainException);
        expect(quizRepositoryStub.find).not.toHaveBeenCalled();
    });
});
