
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
const createMockAnswer = (id: string, isCorrect: boolean): Answer => {
  return Answer.createTextAnswer(
    AnswerId.of(`answer-${id}`),
    new AnswerText(`Answer text ${id}`),
    new IsCorrect(isCorrect)
  );
};

describe('Question Entity (Domain Layer)', () => {
  // ARRANGE: Create real Value Objects for reuse
  const validQuestionId = QuestionId.of('question-uuid-1');
  const validText = new QuestionText('What is the capital of Spain?');
  const validQuizType = new QuestionType('quiz');
  const validTimeLimit = new TimeLimit(30);
  const validPoints = new Points(2000);
  const validMediaId = MediaIdVO.of('media-uuid-for-question');
  const parentQuizId = QuizId.of('quiz-uuid-parent');

  describe('create Factory', () => {
    it('should create a "quiz" type question successfully with 2 to 4 answers', () => {
      // ARRANGE
      const twoAnswers = [createMockAnswer('1', true), createMockAnswer('2', false)];
      const fourAnswers = [
        createMockAnswer('1', true),
        createMockAnswer('2', false),
        createMockAnswer('3', false),
        createMockAnswer('4', false),
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
      const oneAnswer = [createMockAnswer('1', true)];
      const fiveAnswers = Array.from({ length: 5 }, (_, i) => createMockAnswer(i.toString(), i === 0));

      // ACT & ASSERT
      expect(() => Question.create(validQuestionId, validText, null, validQuizType, validTimeLimit, validPoints, oneAnswer))
        .toThrow(DomainException);
      expect(() => Question.create(validQuestionId, validText, null, validQuizType, validTimeLimit, validPoints, fiveAnswers))
        .toThrow('Las preguntas de tipo "quiz" deben tener entre 2 y 4 respuestas.');
    });

    it('should create a "true_false" type question successfully with exactly 2 answers', () => {
        // ARRANGE
        const tfAnswers = [createMockAnswer('1', true), createMockAnswer('2', false)];
        const tfType = new QuestionType('true_false');

        // ACT
        const question = Question.create(validQuestionId, validText, null, tfType, validTimeLimit, validPoints, tfAnswers);

        // ASSERT
        expect(question).toBeInstanceOf(Question);
        expect(question.getAnswers()).toHaveLength(2);
    });

    it('should THROW DomainException if a question has no correct answer', () => {
      // ARRANGE
      const allIncorrect = [createMockAnswer('1', false), createMockAnswer('2', false)];
      
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
      const answers = [createMockAnswer('1', true), createMockAnswer('2', false)];
      question = Question.create(validQuestionId, validText, validMediaId, validQuizType, validTimeLimit, validPoints, answers);
      // We must call the internal `_setQuiz` to test the DTOs that depend on this internal state.
      question._setQuiz(parentQuizId);
    });

    it('toPlainObject should return the correct plain object structure', () => {
      // ACT
      const plain = question.toPlainObject();

      // ASSERT
      expect(plain.id).toBe('question-uuid-1');
      expect(plain.quizId).toBe('quiz-uuid-parent');
      expect(plain.text).toBe('What is the capital of Spain?');
      expect(plain.mediaId).toBe('media-uuid-for-question');
      expect(plain.answers).toHaveLength(2);
      expect(plain.answers[0].isCorrect).toBe(true);
    });

    it('toResponseDto should return the correct response DTO structure', () => {
        // ACT
        const responseDto = question.toResponseDto();

        // ASSERT
        expect(responseDto.slideId).toBe('question-uuid-1');
        expect(responseDto.questionType).toBe('quiz');
        expect(responseDto.questionText).toBe('What is the capital of Spain?');
        expect(responseDto.timeLimitSeconds).toBe(30);
        expect(responseDto.mediaId).toBe('media-uuid-for-question');
        expect(responseDto.options).toHaveLength(2);
        expect(responseDto.options[0].index).toBe('1');
        expect(responseDto.options[0].text).toBe('Answer text 1');
    });
  });
});
