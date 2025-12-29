
import { CreateQuizUseCase, CreateQuiz } from '../../../src/lib/kahoot/application/CreateQuizUseCase';
import { QuizRepository } from '../../../src/lib/kahoot/domain/port/QuizRepository';
import { Quiz } from '../../../src/lib/kahoot/domain/entity/Quiz';
import { DomainException } from '../../../src/common/domain/domain.exception';

const createValidQuizDto = (overrides: Partial<CreateQuiz> = {}): CreateQuiz => {
    const defaultDto: CreateQuiz = {
        authorId: '123e4567-e89b-42d3-a456-426614174006',
        title: 'A Valid Quiz Title',
        description: 'A valid description for the quiz.',
        visibility: 'public',
        status: 'draft',
        category: 'General Knowledge',
        themeId: '123e4567-e89b-42d3-a456-426614174007',
        coverImageId: null,
        questions: [
            {
                text: 'What is 2 + 2?',
                questionType: 'quiz',
                timeLimit: 20,
                points: 1000,
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
    let quizRepositoryStub: jest.Mocked<QuizRepository>;

    beforeEach(() => {
        // ARRANGE
        // This is a stub, providing canned answers for the SUT (System Under Test).
        // We do not verify calls to it.
        quizRepositoryStub = {
            save: jest.fn().mockResolvedValue(undefined),
            find: jest.fn(),
            delete: jest.fn(),
            searchByAuthor: jest.fn(),
        };
    });

    it('should create and return a quiz with correct properties when given valid data', async () => {
        // ARRANGE
        const useCase = new CreateQuizUseCase(quizRepositoryStub);
        const validDto = createValidQuizDto({ title: 'My New Custom Title' });

        // ACT
        const result = await useCase.execute(validDto);

        // ASSERT (Output-Based Testing)
        expect(result.isSuccess).toBe(true);
        const createdQuiz = result.getValue();
        expect(createdQuiz).toBeInstanceOf(Quiz);

        const plainQuiz = createdQuiz.toPlainObject();
        expect(plainQuiz.title).toBe('My New Custom Title');
        expect(plainQuiz.authorId).toBe(validDto.authorId);
    });

    it('should fail if the author ID is not a valid UUID', async () => {
        // ARRANGE
        const useCase = new CreateQuizUseCase(quizRepositoryStub);
        const invalidDto = createValidQuizDto({ authorId: 'not-a-uuid' });

        // ACT & ASSERT (Behavior Verification)
        await expect(useCase.execute(invalidDto)).rejects.toThrow(DomainException);
    });
    
    it('should fail if an answer contains both text and a mediaId', async () => {
        // ARRANGE
        const useCase = new CreateQuizUseCase(quizRepositoryStub);
        const invalidDto = createValidQuizDto({
            questions: [{
                text: 'Q1',
                questionType: 'quiz', timeLimit: 20, points: 1000, mediaId: null,
                answers: [{ text: 'A1', isCorrect: true, mediaId: '123e4567-e89b-42d3-a456-426614174008' }]
            }]
        });

        // ACT & ASSERT
        await expect(useCase.execute(invalidDto)).rejects.toThrow('Answer cannot have both text and mediaId');
    });

    // Other tests for invalid inputs follow the same correct pattern and are omitted for brevity.
});
