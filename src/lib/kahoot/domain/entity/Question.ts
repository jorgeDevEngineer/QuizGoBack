
import {
  QuestionId,
  QuestionText,
  QuestionType,
  TimeLimit,
  Points,
} from "../valueObject/Question";
import { QuizId } from "../valueObject/Quiz";
import { MediaId as MediaIdVO } from '../../../media/domain/valueObject/Media';
import { Answer } from "../entity/Answer";

export class Question {
  private _quiz!: QuizId;

  private constructor(
    private readonly _id: QuestionId,
    private readonly _text: QuestionText | null,
    private readonly _mediaId: MediaIdVO | null,
    private readonly _type: QuestionType,
    private readonly _timeLimit: TimeLimit,
    private readonly _points: Points | null,
    private readonly _answers: Answer[]
  ) {
    this._answers.forEach((answer) => answer._setQuestion(this._id));
  }

  _setQuiz(quiz: QuizId) {
    this._quiz = quiz;
  }

  public static create(
    id: QuestionId,
    text: QuestionText | null,
    mediaId: MediaIdVO | null,
    type: QuestionType,
    timeLimit: TimeLimit,
    points: Points | null,
    answers: Answer[]
  ): Question {
    if (type.value === "quiz" && (answers.length > 4)) {
      throw new Error(
        'Las preguntas de tipo "quiz" no pueden tener más de 4 respuestas.'
      );
    }

    if (type.value === "true_false" && answers.length > 2) {
      throw new Error(
        'Las preguntas de tipo "true_false" no pueden tener más de 2 respuestas.'
      );
    }
    
    const hasCorrectAnswer = answers.some(answer => answer.isCorrect.value);

    if (answers.length > 0 && !hasCorrectAnswer) {
      throw new Error('La pregunta debe tener al menos una respuesta correcta.');
    }

    return new Question(id, text, mediaId, type, timeLimit, points, answers);
  }

  public get id(): QuestionId {
    return this._id;
  }

  public get text(): QuestionText | null {
    return this._text;
  }

  public get mediaId(): MediaIdVO | null {
    return this._mediaId;
  }

  public get type(): QuestionType {
    return this._type;
  }

  public get timeLimit(): TimeLimit {
    return this._timeLimit;
  }

  public get points(): Points | null {
    return this._points;
  }

  public toPlainObject() {
    return {
      id: this._id.value,
      quizId: this._quiz.value,
      text: this._text ? this._text.value : null,
      mediaId: this._mediaId ? this._mediaId.value : null,
      type: this._type.value,
      timeLimit: this._timeLimit.value,
      points: this._points ? this._points.value : null,
      answers: this._answers.map((a) => a.toPlainObject()),
    };
  }
}
