
import { UpdateQuizUseCase, UpdateQuizDto } from '../../../src/lib/kahoot/application/UpdateQuizUseCase';
import { QuizRepository } from '../../../src/lib/kahoot/domain/port/QuizRepository';
import { Quiz } from '../../../src/lib/kahoot/domain/entity/Quiz';
import { Question } from '../../../src/lib/kahoot/domain/entity/Question';
import { Answer } from '../../../src/lib/kahoot/domain/entity/Answer';
import { 
    QuestionId, 
    QuestionText, 
    QuestionType, 
    TimeLimit, 
    Points 
} from '../../../src/lib/kahoot/domain/valueObject/Question';
import { 
    AnswerId, 
    AnswerText, 
    IsCorrect 
} from '../../../src/lib/kahoot/domain/valueObject/Answer';
import {
    QuizId,
    QuizTitle,
    QuizDescription,
    Visibility,
    ThemeId,
    QuizStatus,
    QuizCategory,
    UserId
} from '../../../src/lib/kahoot/domain/valueObject/Quiz';

// Helper to create a valid, REAL Quiz entity for sociable testing.
const createRealQuizForTest = (quizIdStr: string, initialStatus: 'draft' | 'publish' = 'draft'): Quiz => {
    const questionId = QuestionId.generate();
    const answers = [
        Answer.createTextAnswer(AnswerId.generate(), AnswerText.of('Paris'), IsCorrect.fromBoolean(true)),
        Answer.createTextAnswer(AnswerId.generate(), AnswerText.of('London'), IsCorrect.fromBoolean(false)),
    ];

    const question = Question.create(
        questionId,
        QuestionText.of('What is the capital of France?'),
        null, // mediaId
        QuestionType.fromString('quiz'),
        TimeLimit.of(20),
        Points.of(1000),
        answers
    );

    return Quiz.create(
        QuizId.of(quizIdStr),
        UserId.of('123e4567-e89b-42d3-a456-426614174006'),
        QuizTitle.of('Original Title'),
        QuizDescription.of('Original quiz description.'),
        Visibility.fromString('public'),
        QuizStatus.fromString(initialStatus),
        QuizCategory.of('Geography'),
        ThemeId.of('123e4567-e89b-42d3-a456-426614174007'),
        null, // coverImageId
        [question]
    );
};

describe('UpdateQuizUseCase (Application Layer)', () => {
    let quizRepositoryStub: jest.Mocked<QuizRepository>;

    beforeEach(() => {
        quizRepositoryStub = {
            find: jest.fn(),
            save: jest.fn().mockResolvedValue(undefined),
            delete: jest.fn(),
            searchByAuthor: jest.fn(),
        };
    });

    it('should update the title of a draft quiz', async () => {
        // ARRANGE
        const quizId = '123e4567-e89b-42d3-a456-426614174001';
        const realQuiz = createRealQuizForTest(quizId, 'draft');
        quizRepositoryStub.find.mockResolvedValue(realQuiz);

        const useCase = new UpdateQuizUseCase(quizRepositoryStub);

        // FINAL, FINAL FIX: Removing the 'id' property from the question DTO.
        const updateDto: UpdateQuizDto = {
            quizId: quizId,
            authorId: '123e4567-e89b-42d3-a456-426614174006',
            title: 'New Updated Title',
            description: 'Original quiz description.',
            visibility: 'public',
            status: 'draft',
            category: 'Geography',
            themeId: '123e4567-e89b-42d3-a456-426614174007',
            coverImageId: null,
            questions: [
                {
                    questionType: 'quiz',
                    text: 'What is the capital of France?',
                    timeLimit: 20,
                    points: 1000,
                    mediaId: null,
                    answers: [
                        { text: 'Paris', isCorrect: true, mediaId: null },
                        { text: 'London', isCorrect: false, mediaId: null },
                    ]
                }
            ]
        };

        // ACT
        const result = await useCase.execute(updateDto);

        // ASSERT
        expect(result.getValue().toPlainObject().title).toBe('New Updated Title');
    });

    it('should change the status of a quiz from draft to publish', async () => {
        // ARRANGE
        const quizId = '123e4567-e89b-42d3-a456-426614174002';
        const realQuiz = createRealQuizForTest(quizId, 'draft');
        quizRepositoryStub.find.mockResolvedValue(realQuiz);

        const useCase = new UpdateQuizUseCase(quizRepositoryStub);
        
        const updateDto: UpdateQuizDto = {
            quizId: quizId,
            authorId: '123e4567-e89b-42d3-a456-426614174006',
            title: 'Original Title',
            description: 'Original quiz description.',
            visibility: 'public',
            status: 'publish',
            category: 'Geography',
            themeId: '123e4567-e89b-42d3-a456-426614174007',
            coverImageId: null,
            questions: [
                {
                    questionType: 'quiz',
                    text: 'What is the capital of France?',
                    timeLimit: 20,
                    points: 1000,
                    mediaId: null,
                    answers: [
                        { text: 'Paris', isCorrect: true, mediaId: null },
                        { text: 'London', isCorrect: false, mediaId: null },
                    ]
                }
            ]
        };

        // ACT
        const result = await useCase.execute(updateDto);

        // ASSERT
        expect(result.getValue().toPlainObject().status).toBe('publish');
    });

    it('should fail if the quiz to update is not found', async () => {
        // ARRANGE
        const validButNonExistentQuizId = '123e4567-e89b-42d3-a456-426614174999';
        quizRepositoryStub.find.mockResolvedValue(null);
        const useCase = new UpdateQuizUseCase(quizRepositoryStub);
        const updateDto: UpdateQuizDto = { quizId: validButNonExistentQuizId, authorId: '123e4567-e89b-42d3-a456-426614174006', questions:[] } as UpdateQuizDto;

        // ACT & ASSERT
        await expect(useCase.execute(updateDto)).rejects.toThrow('Quiz not found');
    });
});
