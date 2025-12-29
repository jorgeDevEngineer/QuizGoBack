
import { Question } from '../../../../src/lib/kahoot/domain/entity/Question';
import { Answer } from '../../../../src/lib/kahoot/domain/entity/Answer';
import {
  QuestionId,
  QuestionText,
  QuestionType,
  TimeLimit,
  Points,
} from '../../../../src/lib/kahoot/domain/valueObject/Question';
import { AnswerId, AnswerText, IsCorrect } from '../../../../src/lib/kahoot/domain/valueObject/Answer';
import { QuizId } from '../../../../src/lib/kahoot/domain/valueObject/Quiz';
import { MediaId as MediaIdVO } from '../../../../src/lib/media/domain/valueObject/Media';
import { DomainException } from '../../../../src/common/domain/domain.exception';

// Helper to create mock answers for tests
const createMockAnswer = (isCorrect: boolean): Answer => {
  return Answer.createTextAnswer(
    AnswerId.generate(),
    AnswerText.of('Answer text'),
    IsCorrect.fromBoolean(isCorrect)
  );
};

describe('Question Entity (Domain Layer)', () => {
  // ARRANGE: Create real Value Objects for reuse
  const validQuestionId = QuestionId.of('123e4567-e89b-42d3-a456-426614174123');
  const validText = QuestionText.of('What is the capital of Spain?');
  const validQuizType = QuestionType.fromString('quiz');
  const validTimeLimit = TimeLimit.of(30);
  const validPoints = Points.of(2000);
  const validMediaId = MediaIdVO.of('123e4567-e89b-42d3-a456-426614174124');
  const parentQuizId = QuizId.of('123e4567-e89b-42d3-a456-426614174125');

  describe('create Factory', () => {
    it('should create a "quiz" type question successfully with 2 to 4 answers', () => {
      // ARRANGE
      const twoAnswers = [createMockAnswer(true), createMockAnswer(false)];
      const fourAnswers = [
        createMockAnswer(true),
        createMockAnswer(false),
        createMockAnswer(false),
        createMockAnswer(false),
      ];

      // ACT
      const questionWithTwo = Question.create(validQuestionId, validText, null, validQuizType, validTimeLimit, validPoints, twoAnswers);
      const questionWithFour = Question.create(validQuestionId, validText, null, validQuizType, validTimeLimit, validPoints, fourAnswers);
      
      // ASSERT
      expect(questionWithTwo).toBeInstanceOf(Question);
      expect(questionWithTwo.getAnswers()).toHaveLength(2);
      expect(questionWithFour).toBeInstanceOf(Question);
      expect(questionWithFour.getAnswers()).toHaveLength(4);
    });

    it('should THROW DomainException for a "quiz" type question with less than 2 or more than 4 answers', () => {
      // ARRANGE
      const oneAnswer = [createMockAnswer(true)];
      const fiveAnswers = Array.from({ length: 5 }, (_, i) => createMockAnswer(i === 0));

      // ACT & ASSERT
      expect(() => Question.create(validQuestionId, validText, null, validQuizType, validTimeLimit, validPoints, oneAnswer))
        .toThrow(DomainException);
      expect(() => Question.create(validQuestionId, validText, null, validQuizType, validTimeLimit, validPoints, fiveAnswers))
        .toThrow('Las preguntas de tipo "quiz" deben tener entre 2 y 4 respuestas.');
    });

    it('should create a "true_false" type question successfully with exactly 2 answers', () => {
        // ARRANGE
        const tfAnswers = [createMockAnswer(true), createMockAnswer(false)];
        const tfType = QuestionType.fromString('true_false');

        // ACT
        const question = Question.create(validQuestionId, validText, null, tfType, validTimeLimit, validPoints, tfAnswers);

        // ASSERT
        expect(question).toBeInstanceOf(Question);
        expect(question.getAnswers()).toHaveLength(2);
    });

    it('should THROW DomainException if a question has no correct answer', () => {
      // ARRANGE
      const allIncorrect = [createMockAnswer(false), createMockAnswer(false)];
      
      // ACT & ASSERT
      expect(() => Question.create(validQuestionId, validText, null, validQuizType, validTimeLimit, validPoints, allIncorrect))
        .toThrow(DomainException);
      expect(() => Question.create(validQuestionId, validText, null, validQuizType, validTimeLimit, validPoints, allIncorrect))
        .toThrow('La pregunta debe tener al menos una respuesta correcta.');
    });
  });

  describe('Data Transformation Objects (DTOs)', () => {
    let question: Question;

    beforeEach(() => {
      // ARRANGE
      const answers = [createMockAnswer(true), createMockAnswer(false)];
      question = Question.create(validQuestionId, validText, validMediaId, validQuizType, validTimeLimit, validPoints, answers);
      // We must call the internal `_setQuiz` to test the DTOs that depend on this internal state.
      question._setQuiz(parentQuizId);
    });

    it('toPlainObject should return the correct plain object structure', () => {
      // ACT
      const plain = question.toPlainObject();

      // ASSERT
      expect(plain.id).toBe('123e4567-e89b-42d3-a456-426614174123');
      expect(plain.quizId).toBe('123e4567-e89b-42d3-a456-426614174125');
      expect(plain.text).toBe('What is the capital of Spain?');
      expect(plain.mediaId).toBe('123e4567-e89b-42d3-a456-426614174124');
      expect(plain.answers).toHaveLength(2);
      expect(plain.answers[0].isCorrect).toBe(true);
    });

    it('toResponseDto should return the correct response DTO structure', () => {
        // ACT
        const responseDto = question.toResponseDto();

        // ASSERT
        expect(responseDto.slideId).toBe('123e4567-e89b-42d3-a456-426614174123');
        expect(responseDto.questionType).toBe('quiz');
        expect(responseDto.questionText).toBe('What is the capital of Spain?');
        expect(responseDto.timeLimitSeconds).toBe(30);
        expect(responseDto.mediaId).toBe('123e4567-e89b-42d3-a456-426614174124');
        expect(responseDto.options).toHaveLength(2);
        expect(responseDto.options[0].index).toBe('1');
        expect(responseDto.options[0].text).toBe('Answer text');
    });
  });
});
