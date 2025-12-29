
import { DeleteQuizUseCase } from '../../../src/lib/kahoot/application/DeleteQuizUseCase';
import { QuizRepository } from '../../../src/lib/kahoot/domain/port/QuizRepository';
import { Quiz } from '../../../src/lib/kahoot/domain/entity/Quiz';
import { DomainException } from '../../../src/common/domain/domain.exception';
import { QuizId } from '../../../src/lib/kahoot/domain/valueObject/Quiz';

const createDummyQuiz = (id: string): Quiz => {
    // A real entity is used, but its internal state is irrelevant for this test.
    return { id: QuizId.of(id) } as unknown as Quiz;
}

describe('DeleteQuizUseCase (Application Layer)', () => {
  let quizRepositoryStub: jest.Mocked<QuizRepository>;

  beforeEach(() => {
    // ARRANGE
    quizRepositoryStub = {
      find: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
      save: jest.fn(),
      searchByAuthor: jest.fn(),
    };
  });

  it('should return a success result when an existing quiz is deleted', async () => {
    // ARRANGE
    const quizId = '123e4567-e89b-42d3-a456-426614174010';
    const dummyQuiz = createDummyQuiz(quizId);
    // We configure the stub to simulate that the quiz exists.
    quizRepositoryStub.find.mockResolvedValue(dummyQuiz);

    const useCase = new DeleteQuizUseCase(quizRepositoryStub);

    // ACT
    const result = await useCase.execute(quizId);

    // ASSERT (Output-Based Testing)
    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBeNull(); // Successful void operations return null.
  });

  it('should fail if the quiz to delete does not exist', async () => {
    // ARRANGE
    const nonExistentQuizId = '123e4567-e89b-42d3-a456-426614174011';
    // Configure the stub to simulate that the quiz is not found.
    quizRepositoryStub.find.mockResolvedValue(null);

    const useCase = new DeleteQuizUseCase(quizRepositoryStub);

    // ACT & ASSERT (Behavior Verification)
    await expect(useCase.execute(nonExistentQuizId)).rejects.toThrow('Quiz not found');
  });
  
  it('should fail if the provided ID is not a valid UUID', async () => {
    // ARRANGE
    const invalidId = 'short-invalid-id';
    const useCase = new DeleteQuizUseCase(quizRepositoryStub);

    // ACT & ASSERT
    await expect(useCase.execute(invalidId)).rejects.toThrow(DomainException);
  });
});
