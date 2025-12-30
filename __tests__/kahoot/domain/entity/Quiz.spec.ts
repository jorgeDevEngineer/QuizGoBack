
import { Quiz } from '../../../../src/lib/kahoot/domain/entity/Quiz';
import { Question } from '../../../../src/lib/kahoot/domain/entity/Question';
import { Answer } from '../../../../src/lib/kahoot/domain/entity/Answer';
import {
  QuizId,
  UserId,
  QuizTitle,
  QuizDescription,
  Visibility,
  QuizStatus,
  QuizCategory,
  ThemeId,
} from '../../../../src/lib/kahoot/domain/valueObject/Quiz';
import {
  QuestionId,
  QuestionText,
  QuestionType,
  TimeLimit,
  Points,
} from '../../../../src/lib/kahoot/domain/valueObject/Question';
import { AnswerId, AnswerText, IsCorrect } from '../../../../src/lib/kahoot/domain/valueObject/Answer';
import { DomainException } from '../../../../src/lib/shared/exceptions/domain.exception';

// Helper function to create a valid question with real domain objects
const createValidQuestion = (text: string, questionUuid: string): Question => {
  const answer1 = Answer.createTextAnswer(
    AnswerId.generate(),
    AnswerText.of('Answer 1'),
    IsCorrect.fromBoolean(true)
  );
  const answer2 = Answer.createTextAnswer(
    AnswerId.generate(),
    AnswerText.of('Answer 2'),
    IsCorrect.fromBoolean(false)
  );
  return Question.create(
    QuestionId.of(questionUuid),
    QuestionText.of(text),
    null,
    QuestionType.fromString('quiz'),
    TimeLimit.of(20),
    Points.of(1000),
    [answer1, answer2]
  );
};

describe('Quiz Entity (Domain Layer)', () => {
  // ARRANGE: Create real instances of Value Objects for tests
  const validQuizId = QuizId.of('123e4567-e89b-42d3-a456-426614174123');
  const validAuthorId = UserId.of('123e4567-e89b-42d3-a456-426614174126');
  const validTitle = QuizTitle.of('My Awesome Quiz')!;
  const validDescription = QuizDescription.of('A quiz about awesome things.')!;
  const validVisibility = Visibility.fromString('public');
  const validStatus = QuizStatus.fromString('draft');
  const validCategory = QuizCategory.of('science')!;
  const validThemeId = ThemeId.of('123e4567-e89b-42d3-a456-426614174127');

  it('should create a quiz successfully with valid data', () => {
    // ARRANGE
    const question = createValidQuestion('What is 2+2?', '123e4567-e89b-42d3-a456-426614174128');

    // ACT: Use the public factory method
    const quiz = Quiz.create(
      validQuizId,
      validAuthorId,
      validTitle,
      validDescription,
      validVisibility,
      validStatus,
      validCategory,
      validThemeId,
      null,
      [question]
    );

    // ASSERT (Output-Based Testing): Test observable state via public API
    expect(quiz).toBeInstanceOf(Quiz);
    expect(quiz.id.getValue()).toBe(validQuizId.getValue());
    expect(quiz.toPlainObject().title).toBe('My Awesome Quiz');
    expect(quiz.getQuestions()).toHaveLength(1);
  });

  it('should THROW a DomainException if created with an empty array of questions', () => {
    // ARRANGE: Define the action that should fail
    const createQuizAction = () => {
      Quiz.create(
        validQuizId,
        validAuthorId,
        validTitle,
        validDescription,
        validVisibility,
        validStatus,
        validCategory,
        validThemeId,
        null,
        [] // Invalid: Violates the invariant
      );
    };

    // ACT & ASSERT: Verify that the specific domain exception is thrown
    expect(createQuizAction).toThrow(DomainException);
    expect(createQuizAction).toThrow('A quiz must have at least one question.');
  });

  it('should allow replacing questions with a valid new set', () => {
    // ARRANGE
    const initialQuestion = createValidQuestion('Initial Question', '123e4567-e89b-42d3-a456-426614174129');
    const quiz = Quiz.create(validQuizId, validAuthorId, validTitle, validDescription, validVisibility, validStatus, validCategory, validThemeId, null, [initialQuestion]);
    const newQuestion1 = createValidQuestion('New Question 1', '123e4567-e89b-42d3-a456-426614174130');
    const newQuestion2 = createValidQuestion('New Question 2', '123e4567-e89b-42d3-a456-426614174131');

    // ACT: Use the public method to change the state
    quiz.replaceQuestions([newQuestion1, newQuestion2]);

    // ASSERT: Check the new observable state
    expect(quiz.getQuestions()).toHaveLength(2);
    expect(quiz.getQuestions()[0].toPlainObject().text).toBe('New Question 1');
  });

  it('should THROW a DomainException when replacing questions with an empty array', () => {
    // ARRANGE
    const question = createValidQuestion('A question', '123e4567-e89b-42d3-a456-426614174132');
    const quiz = Quiz.create(validQuizId, validAuthorId, validTitle, validDescription, validVisibility, validStatus, validCategory, validThemeId, null, [question]);
    const replaceAction = () => {
      quiz.replaceQuestions([]); // Invalid: Violates the invariant
    };

    // ACT & ASSERT
    expect(replaceAction).toThrow(DomainException);
    expect(replaceAction).toThrow('A quiz must have at least one question.');
  });

  it('should find a question by its ID using public getter', () => {
    // ARRANGE
    const questionIdToFind = QuestionId.of('123e4567-e89b-42d3-a456-426614174134');
    const question1 = createValidQuestion('Question 1', '123e4567-e89b-42d3-a456-426614174133');
    const questionToFind = createValidQuestion('Question to Find', questionIdToFind.value);
    const quiz = Quiz.create(validQuizId, validAuthorId, validTitle, validDescription, validVisibility, validStatus, validCategory, validThemeId, null, [question1, questionToFind]);
    
    // ACT
    const foundQuestion = quiz.getQuestionById(questionIdToFind);
    
    // ASSERT
    expect(foundQuestion).toBeDefined();
    expect(foundQuestion.id.value).toBe(questionIdToFind.value);
  });
  
  it('should THROW DomainException when a question ID is not found', () => {
    // ARRANGE
    const question = createValidQuestion('q-1', '123e4567-e89b-42d3-a456-426614174135');
    const quiz = Quiz.create(validQuizId, validAuthorId, validTitle, validDescription, validVisibility, validStatus, validCategory, validThemeId, null, [question]);
    const notFoundId = QuestionId.of('123e4567-e89b-42d3-a456-426614174999'); // A different, non-existent ID

    // ACT & ASSERT
    expect(() => quiz.getQuestionById(notFoundId)).toThrow(DomainException);
    expect(() => quiz.getQuestionById(notFoundId)).toThrow(`Question with id ${notFoundId.getValue()} not found in this quiz.`);
  });
});
