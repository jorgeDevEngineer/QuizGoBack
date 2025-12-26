
import { DeleteQuizUseCase } from '../../../src/lib/kahoot/application/DeleteQuizUseCase';
import { QuizRepository } from '../../../src/lib/kahoot/domain/port/QuizRepository';
import { Quiz } from '../../../src/lib/kahoot/domain/entity/Quiz';
import { Result } from '../../../src/common/domain/result';
import { DomainException } from '../../../src/common/domain/domain.exception';
import { QuizId } from '../../../src/lib/kahoot/domain/valueObject/Quiz';

// Helper to create a dummy quiz instance for repository stubbing
const createDummyQuiz = (id: string): Quiz => {
    // The internal details of this quiz don't matter for the test, 
    // it just needs to exist.
    return {
        id: QuizId.of(id),
        //... other properties are not needed for this test
    } as Quiz;
}

describe('DeleteQuizUseCase (Application Layer)', () => {
  let quizRepositoryStub: QuizRepository;

  beforeEach(() => {
    // 1. STUB the Repository (Managed Dependency)
    quizRepositoryStub = {
      find: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined), // Assume delete is successful
      // Other repository methods are not used by this use case
      save: jest.fn(),
      findById: jest.fn(),
      findAllByAuthor: jest.fn(),
    };
  });

  it('should return a SUCCESS Result when the quiz exists and is deleted', async () => {
    // ARRANGE
    const quizId = 'quiz-uuid-to-delete';
    const dummyQuiz = createDummyQuiz(quizId);
    (quizRepositoryStub.find as jest.Mock).mockResolvedValue(dummyQuiz);

    const useCase = new DeleteQuizUseCase(quizRepositoryStub);

    // ACT
    const result = await useCase.execute(quizId);

    // ASSERT (State-Based Testing)
    // a. Check that the operation was successful
    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBeUndefined(); // Result<void> has undefined value

    // b. (Permitted for this specific check) Verify the collaborators were called as expected
    // We verify `find` to ensure the check was made, and `delete` to confirm the action was taken.
    // This is a borderline case, but acceptable to confirm the core logic flow.
    expect(quizRepositoryStub.find).toHaveBeenCalledWith(QuizId.of(quizId));
    expect(quizRepositoryStub.delete).toHaveBeenCalledWith(QuizId.of(quizId));
  });

  it('should THROW a DomainException if the quiz to delete is not found', async () => {
    // ARRANGE
    const nonExistentQuizId = 'non-existent-quiz-uuid';
    // Configure the stub to simulate that the quiz is not found
    (quizRepositoryStub.find as jest.Mock).mockResolvedValue(null);

    const useCase = new DeleteQuizUseCase(quizRepositoryStub);

    // ACT & ASSERT
    // The execute method should reject with a DomainException
    await expect(useCase.execute(nonExistentQuizId)).rejects.toThrow(DomainException);
    await expect(useCase.execute(nonExistentQuizId)).rejects.toThrow('Quiz not found');

    // Verify that the delete method was NOT called, as the operation should have stopped.
    expect(quizRepositoryStub.delete).not.toHaveBeenCalled();
  });
  
  it('should let a DomainException from an invalid ID bubble up', async () => {
    // ARRANGE
    const invalidId = 'short'; // This will fail QuizId.of() validation
    const useCase = new DeleteQuizUseCase(quizRepositoryStub);

    // ACT & ASSERT
    // The exception is thrown synchronously during ID creation
    await expect(useCase.execute(invalidId)).rejects.toThrow(DomainException);
  });
});
