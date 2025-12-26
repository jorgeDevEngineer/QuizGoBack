
import { CreateQuizUseCase, CreateQuiz } from '../../../src/lib/kahoot/application/CreateQuizUseCase';
import { QuizRepository } from '../../../src/lib/kahoot/domain/port/QuizRepository';
import { Quiz } from '../../../src/lib/kahoot/domain/entity/Quiz';
import { Result } from '../../../src/common/domain/result';
import { DomainException } from '../../../src/common/domain/domain.exception';

// Helper to create a valid DTO for creating a quiz, reducing boilerplate
const createValidQuizDto = (overrides: Partial<CreateQuiz> = {}): CreateQuiz => {
    const defaultDto: CreateQuiz = {
        authorId: 'valid-author-uuid',
        title: 'A Valid Quiz Title',
        description: 'A valid description for the quiz.',
        visibility: 'public',
        status: 'draft',
        category: 'General Knowledge',
        themeId: 'default-theme',
        coverImageId: null,
        questions: [
            {
                text: 'What is 2 + 2?',
                questionType: 'quiz',
                timeLimit: 20,
                points: 100,
                mediaId: null,
                answers: [
                    { text: '4', isCorrect: true, mediaId: null },
                    { text: '3', isCorrect: false, mediaId: null },
                ],
            },
        ],
    };
    return { ...defaultDto, ...overrides };
};

describe('CreateQuizUseCase (Application Layer)', () => {
    let quizRepositoryStub: QuizRepository;

    beforeEach(() => {
        // 1. STUB the repository
        quizRepositoryStub = {
            save: jest.fn().mockResolvedValue(undefined), // Assume save is successful
            // Other methods are not relevant for this use case
            find: jest.fn(),
            findById: jest.fn(),
            delete: jest.fn(),
            searchByAuthor: jest.fn(),
            findAllByAuthor: jest.fn(),
        };
    });

    it('should successfully create a quiz and return a SUCCESS Result', async () => {
        // ARRANGE
        const useCase = new CreateQuizUseCase(quizRepositoryStub);
        const validDto = createValidQuizDto();

        // ACT
        const result = await useCase.execute(validDto);

        // ASSERT
        // a. Check for success
        expect(result.isSuccess).toBe(true);

        // b. Verify the collaborator was called correctly (Interaction Testing)
        // We expect `save` to have been called with an instance of a Quiz.
        expect(quizRepositoryStub.save).toHaveBeenCalledTimes(1);
        expect(quizRepositoryStub.save).toHaveBeenCalledWith(expect.any(Quiz));

        // c. Check the returned value
        const createdQuiz = result.getValue();
        expect(createdQuiz).toBeInstanceOf(Quiz);
        expect(createdQuiz.properties().title.value).toBe(validDto.title);
    });

    it('should THROW a DomainException if an invalid authorId is provided', async () => {
        // ARRANGE
        const useCase = new CreateQuizUseCase(quizRepositoryStub);
        const invalidDto = createValidQuizDto({ authorId: 'not-a-uuid' });

        // ACT & ASSERT
        // The exception comes from UserId.of(), which is synchronous within the async method.
        await expect(useCase.execute(invalidDto)).rejects.toThrow(DomainException);
        // We ensure that if validation fails early, we don't attempt to save.
        expect(quizRepositoryStub.save).not.toHaveBeenCalled();
    });
    
    it('should THROW a DomainException if an answer has both text and mediaId', async () => {
        // ARRANGE
        const useCase = new CreateQuizUseCase(quizRepositoryStub);
        const invalidDto = createValidQuizDto({
            questions: [{
                text: 'Q1',
                questionType: 'quiz', timeLimit: 20, points: 100, mediaId: null,
                answers: [{ text: 'A1', isCorrect: true, mediaId: 'some-media-id' }]
            }]
        });

        // ACT & ASSERT
        await expect(useCase.execute(invalidDto)).rejects.toThrow('Answer cannot have both text and mediaId');
        expect(quizRepositoryStub.save).not.toHaveBeenCalled();
    });

    it('should THROW a DomainException if an answer has neither text nor mediaId', async () => {
        // ARRANGE
        const useCase = new CreateQuizUseCase(quizRepositoryStub);
        const invalidDto = createValidQuizDto({
            questions: [{
                text: 'Q1',
                questionType: 'quiz', timeLimit: 20, points: 100, mediaId: null,
                answers: [{ text: null, isCorrect: true, mediaId: null }]
            }]
        });

        // ACT & ASSERT
        await expect(useCase.execute(invalidDto)).rejects.toThrow('Answer must have either text or mediaId');
        expect(quizRepositoryStub.save).not.toHaveBeenCalled();
    });
    
    // This test verifies that if any nested Value Object throws an error (e.g., invalid title),
    // the exception bubbles up correctly.
    it('should let exceptions from nested Value Objects bubble up', async () => {
        // ARRANGE
        const useCase = new CreateQuizUseCase(quizRepositoryStub);
        const invalidDto = createValidQuizDto({ title: 'a' }); // Title is too short

        // ACT & ASSERT
        await expect(useCase.execute(invalidDto)).rejects.toThrow(DomainException);
        expect(quizRepositoryStub.save).not.toHaveBeenCalled();
    });
});
