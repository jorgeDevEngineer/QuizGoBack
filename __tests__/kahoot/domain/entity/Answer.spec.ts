
import { Answer } from '../../../../src/lib/kahoot/domain/entity/Answer';
import { AnswerId, AnswerText, IsCorrect } from '../../../../src/lib/kahoot/domain/valueObject/Answer';
import { MediaId as MediaIdVO } from '../../../../src/lib/media/domain/valueObject/Media';
import { QuestionId } from '../../../../src/lib/kahoot/domain/valueObject/Question';
import { DomainException } from '../../../../src/common/domain/domain.exception';

describe('Answer Entity (Domain Layer)', () => {
  // ARRANGE: Create real instances of Value Objects for tests
  const validAnswerId = AnswerId.of('123e4567-e89b-42d3-a456-426614174123');
  const validText = AnswerText.of('This is a correct answer');
  const validIsCorrect = IsCorrect.fromBoolean(true);
  const validMediaId = MediaIdVO.of('123e4567-e89b-42d3-a456-426614174124');
  const questionId = QuestionId.of('123e4567-e89b-42d3-a456-426614174125'); // Needed for toPlainObject

  describe('createTextAnswer Factory', () => {
    it('should create a text-based answer successfully', () => {
      // ACT
      const answer = Answer.createTextAnswer(validAnswerId, validText, validIsCorrect);

      // ASSERT
      expect(answer).toBeInstanceOf(Answer);
      expect(answer.id.value).toBe(validAnswerId.value);
      expect(answer.isCorrect.value).toBe(true);
      expect(answer.getText()).toBe(validText);
      expect(answer.getMediaId()).toBeNull();
    });

    it('should THROW a DomainException if text is not provided', () => {
      // ARRANGE
      const createAction = () => {
        Answer.createTextAnswer(validAnswerId, null, validIsCorrect);
      };

      // ACT & ASSERT
      expect(createAction).toThrow(DomainException);
      expect(createAction).toThrow('Text-based answer must have text.');
    });
  });

  describe('createMediaAnswer Factory', () => {
    it('should create a media-based answer successfully', () => {
      // ACT
      const answer = Answer.createMediaAnswer(validAnswerId, validMediaId, validIsCorrect);

      // ASSERT
      expect(answer).toBeInstanceOf(Answer);
      expect(answer.id.value).toBe(validAnswerId.value);
      expect(answer.isCorrect.value).toBe(true);
      expect(answer.getMediaId()).toBe(validMediaId);
      expect(answer.getText()).toBeNull();
    });

    it('should THROW a DomainException if mediaId is not provided', () => {
      // ARRANGE
      const createAction = () => {
        Answer.createMediaAnswer(validAnswerId, null, validIsCorrect);
      };

      // ACT & ASSERT
      expect(createAction).toThrow(DomainException);
      expect(createAction).toThrow('Media-based answer must have a mediaId.');
    });
  });

  describe('toPlainObject Method', () => {
    beforeAll(() => {
        // Mock environment variable for consistent output
        process.env.BASE_URL = 'http://test.com';
    });
    
    it('should return a correct plain object for a text answer', () => {
      // ARRANGE
      const answer = Answer.createTextAnswer(validAnswerId, validText, validIsCorrect);
      // The entity mutates its internal state after creation, which is not ideal.
      // We call the internal method to be able to test toPlainObject.
      answer._setQuestion(questionId);

      // ACT
      const plainObject = answer.toPlainObject();

      // ASSERT
      expect(plainObject).toEqual({
        id: '123e4567-e89b-42d3-a456-426614174123',
        questionId: '123e4567-e89b-42d3-a456-426614174125',
        text: 'This is a correct answer',
        mediaId: null,
        isCorrect: true,
      });
    });

    it('should return a correct plain object for a media answer', () => {
        // ARRANGE
        const answer = Answer.createMediaAnswer(validAnswerId, validMediaId, validIsCorrect);
        answer._setQuestion(questionId);
  
        // ACT
        const plainObject = answer.toPlainObject();
  
        // ASSERT
        expect(plainObject).toEqual({
          id: '123e4567-e89b-42d3-a456-426614174123',
          questionId: '123e4567-e89b-42d3-a456-426614174125',
          text: null,
          mediaId: 'http://test.com/media/123e4567-e89b-42d3-a456-426614174124',
          isCorrect: true,
        });
      });
  });
});
