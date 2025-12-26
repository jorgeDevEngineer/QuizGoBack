
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
import { DomainException } from '../../../../src/common/domain/domain.exception';

// Helper function to create a valid question with real domain objects
const createValidQuestion = (text: string, id: string): Question => {
  const answer1 = Answer.createTextAnswer(
    AnswerId.of(`answer-uuid-${id}-1`),
    new AnswerText('Answer 1'),
    new IsCorrect(true)
  );
  const answer2 = Answer.createTextAnswer(
    AnswerId.of(`answer-uuid-${id}-2`),
    new AnswerText('Answer 2'),
    new IsCorrect(false)
  );
  return Question.create(
    QuestionId.of(`question-uuid-${id}`),
    new QuestionText(text),
    null,
    new QuestionType('quiz'),
    new TimeLimit(20),
    new Points(1000),
    [answer1, answer2]
  );
};

describe('Quiz Entity (Domain Layer)', () => {
  // ARRANGE: Create real instances of Value Objects for tests
  const validQuizId = QuizId.of('quiz-uuid-1');
  const validAuthorId = UserId.of('user-uuid-1');
  const validTitle = new QuizTitle('My Awesome Quiz');
  const validDescription = new QuizDescription('A quiz about awesome things.');
  const validVisibility = new Visibility('public');
  const validStatus = new QuizStatus('draft');
  const validCategory = new QuizCategory('science');
  const validThemeId = ThemeId.of('theme-uuid-1');

  it('should create a quiz successfully with valid data', () => {
    // ARRANGE
    const question = createValidQuestion('What is 2+2?', 'q1');

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
    expect(quiz.id.equals(validQuizId)).toBe(true);
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
    const initialQuestion = createValidQuestion('Initial Question', 'q1');
    const quiz = Quiz.create(validQuizId, validAuthorId, validTitle, validDescription, validVisibility, validStatus, validCategory, validThemeId, null, [initialQuestion]);
    const newQuestion1 = createValidQuestion('New Question 1', 'q2');
    const newQuestion2 = createValidQuestion('New Question 2', 'q3');

    // ACT: Use the public method to change the state
    quiz.replaceQuestions([newQuestion1, newQuestion2]);

    // ASSERT: Check the new observable state
    expect(quiz.getQuestions()).toHaveLength(2);
    expect(quiz.getQuestions()[0].text.value).toBe('New Question 1');
  });

  it('should THROW a DomainException when replacing questions with an empty array', () => {
    // ARRANGE
    const question = createValidQuestion('A question', 'q1');
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
    const questionIdToFind = QuestionId.of('find-me');
    const question1 = createValidQuestion('Question 1', 'q1');
    const questionToFind = createValidQuestion('Question to Find', 'find-me');
    const quiz = Quiz.create(validQuizId, validAuthorId, validTitle, validDescription, validVisibility, validStatus, validCategory, validThemeId, null, [question1, questionToFind]);
    
    // ACT
    const foundQuestion = quiz.getQuestionById(questionIdToFind);
    
    // ASSERT
    expect(foundQuestion).toBe(questionToFind);
    expect(foundQuestion.id.equals(questionIdToFind)).toBe(true);
  });
  
  it('should THROW DomainException when a question ID is not found', () => {
    // ARRANGE
    const question = createValidQuestion('q-1', 'q1');
    const quiz = Quiz.create(validQuizId, validAuthorId, validTitle, validDescription, validVisibility, validStatus, validCategory, validThemeId, null, [question]);
    const notFoundId = QuestionId.of('not-found-id');

    // ACT & ASSERT
    expect(() => quiz.getQuestionById(notFoundId)).toThrow(DomainException);
    expect(() => quiz.getQuestionById(notFoundId)).toThrow(`Question with id ${notFoundId.getValue()} not found in this quiz.`);
  });
});
