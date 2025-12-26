
import { UpdateQuizUseCase, UpdateQuizDto } from '../../../src/lib/kahoot/application/UpdateQuizUseCase';
import { QuizRepository } from '../../../src/lib/kahoot/domain/port/QuizRepository';
import { Quiz } from '../../../src/lib/kahoot/domain/entity/Quiz';
import { Question } from '../../../src/lib/kahoot/domain/entity/Question';
import { Result } from '../../../src/common/domain/result';
import { DomainException } from '../../../src/common/domain/domain.exception';
import { QuizId, QuizTitle } from '../../../src/lib/kahoot/domain/valueObject/Quiz';

// Helper to create a valid DTO, reducing boilerplate in tests
const createValidUpdateDto = (overrides: Partial<UpdateQuizDto> = {}): UpdateQuizDto => {
  const defaultDto: UpdateQuizDto = {
    quizId: 'existing-quiz-uuid',
    authorId: 'author-uuid',
    title: 'Updated Title',
    description: 'Updated Description',
    visibility: 'public',
    status: 'published',
    category: 'Science',
    themeId: 'theme-uuid-123',
    coverImageId: 'cover-image-uuid-456',
    questions: [
      {
        questionType: 'quiz',
        text: 'What is the powerhouse of the cell?',
        timeLimit: 30,
        points: 1000,
        mediaId: null,
        answers: [
          { text: 'Mitochondria', isCorrect: true },
          { text: 'Nucleus', isCorrect: false },
        ],
      },
    ],
  };
  return { ...defaultDto, ...overrides };
};

describe('UpdateQuizUseCase (Application Layer)', () => {
  let quizRepositoryStub: QuizRepository;
  // We MOCK the Quiz entity to verify that the use case correctly orchestrates it.
  let mockQuiz: jest.Mocked<Quiz>;

  beforeEach(() => {
    // 1. MOCK the Quiz entity that we expect to be returned from the repository
    mockQuiz = {
      id: QuizId.of('existing-quiz-uuid'),
      updateMetadata: jest.fn(),
      replaceQuestions: jest.fn(),
    } as unknown as jest.Mocked<Quiz>;

    // 2. STUB the Repository to control its behavior
    quizRepositoryStub = {
      find: jest.fn().mockResolvedValue(mockQuiz), // By default, find returns the mock quiz
      save: jest.fn().mockResolvedValue(undefined), // Assume save is successful
      // Other methods are not used
      findById: jest.fn(),
      delete: jest.fn(),
      findAllByAuthor: jest.fn(),
    };
  });

  it('should successfully update a quiz and save it', async () => {
    // ARRANGE
    const useCase = new UpdateQuizUseCase(quizRepositoryStub);
    const updateDto = createValidUpdateDto();

    // ACT
    const result = await useCase.execute(updateDto);

    // ASSERT (Interaction-Based Testing)
    // a. Verify the result is successful and contains the (mocked) quiz
    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBe(mockQuiz);

    // b. Verify the use case called the entity's methods correctly
    expect(mockQuiz.updateMetadata).toHaveBeenCalledTimes(1);
    expect(mockQuiz.replaceQuestions).toHaveBeenCalledTimes(1);
    // Check that the arguments passed to replaceQuestions are Question instances
    const questionsArg = mockQuiz.replaceQuestions.mock.calls[0][0];
    expect(questionsArg[0]).toBeInstanceOf(Question);

    // c. Verify the final state was persisted
    expect(quizRepositoryStub.save).toHaveBeenCalledWith(mockQuiz);
  });

  it('should THROW a DomainException if the quiz is not found', async () => {
    // ARRANGE
    // Sabotage the stub for this test case
    (quizRepositoryStub.find as jest.Mock).mockResolvedValue(null);
    const useCase = new UpdateQuizUseCase(quizRepositoryStub);
    const updateDto = createValidUpdateDto();

    // ACT & ASSERT
    await expect(useCase.execute(updateDto)).rejects.toThrow(DomainException);
    await expect(useCase.execute(updateDto)).rejects.toThrow('Quiz not found');
    // Ensure we didn't try to save anything if the quiz wasn't found
    expect(quizRepositoryStub.save).not.toHaveBeenCalled();
  });

  describe('Published Quiz Validations', () => {
    it('should THROW if title is missing for a published quiz', async () => {
        const useCase = new UpdateQuizUseCase(quizRepositoryStub);
        const invalidDto = createValidUpdateDto({ status: 'published', title: '' });

        await expect(useCase.execute(invalidDto)).rejects.toThrow('Title, description, and category are required for published quizzes.');
    });

    it('should THROW if a question text is missing for a published quiz', async () => {
        const useCase = new UpdateQuizUseCase(quizRepositoryStub);
        const invalidDto = createValidUpdateDto({
            status: 'published',
            questions: [{ questionType: 'quiz', text: '', timeLimit: 20, points: 1000, answers: [{text: 'A', isCorrect: true}] }]
        });

        await expect(useCase.execute(invalidDto)).rejects.toThrow('Question text is required for published quizzes.');
    });
  });
  
  it('should allow a draft quiz to be updated with missing information', async () => {
    // ARRANGE
    const useCase = new UpdateQuizUseCase(quizRepositoryStub);
    const draftDto = createValidUpdateDto({ 
        status: 'draft', 
        title: '', // Title is empty
        questions: [] // No questions
    });

    // ACT
    const result = await useCase.execute(draftDto);

    // ASSERT
    expect(result.isSuccess).toBe(true);
    expect(mockQuiz.updateMetadata).toHaveBeenCalled();
    expect(mockQuiz.replaceQuestions).toHaveBeenCalledWith([]);
    expect(quizRepositoryStub.save).toHaveBeenCalled();
  });

  it('should let exceptions from entity/VO creation bubble up', async () => {
    // ARRANGE
    const useCase = new UpdateQuizUseCase(quizRepositoryStub);
    // Pass a title that is too long, which should cause QuizTitle.of() to throw
    const invalidDto = createValidUpdateDto({ title: 'a'.repeat(200) });

    // ACT & ASSERT
    await expect(useCase.execute(invalidDto)).rejects.toThrow(DomainException);
  });
});
