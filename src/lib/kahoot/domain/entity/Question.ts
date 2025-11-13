import {
  QuestionId,
  QuestionText,
  QuestionType,
  TimeLimit,
  Points,
} from "../valueObject/Question";
import { MediaUrl, QuizId } from "../valueObject/Quiz";
import { Answer } from "../entity/Answer";

export class Question {
  private _quiz!: QuizId; // Referencia al Quiz padre.

  private constructor(
    private readonly _id: QuestionId,
    private readonly _text: QuestionText,
    private readonly _media: MediaUrl,
    private readonly _type: QuestionType,
    private readonly _timeLimit: TimeLimit,
    private readonly _points: Points,
    private readonly _answers: Answer[]
  ) {
    // Asignamos la referencia de esta pregunta a cada una de sus respuestas.
    this._answers.forEach((answer) => answer._setQuestion(this._id));
  }

  /**
   * Asigna el quiz padre a esta pregunta.
   * Este método solo debe ser llamado por el constructor de Quiz.
   * @param quiz La instancia del quiz padre.
   */
  _setQuiz(quiz: QuizId) {
    this._quiz = quiz;
  }

  // El método de factoría ahora exige los Value Objects correctos.
  public static create(
    id: QuestionId,
    text: QuestionText,
    media: MediaUrl,
    type: QuestionType,
    timeLimit: TimeLimit,
    points: Points,
    answers: Answer[]
  ): Question {
    // Validación de número de respuestas (existente)
    if (type.value === "quiz" && (answers.length < 2 || answers.length > 4)) {
      throw new Error(
        'Las preguntas de tipo "quiz" deben tener entre 2 y 4 respuestas.'
      );
    }

    if (type.value === "true_false" && answers.length !== 2) {
      throw new Error(
        'Las preguntas de tipo "true_false" deben tener exactamente 2 respuestas.'
      );
    }
    
    // Verificamos que al menos una respuesta sea correcta.
    // (Asume que la entidad Answer tiene un getter `isCorrect`)
    const hasCorrectAnswer = answers.some(answer => answer.isCorrect.value);

    if (!hasCorrectAnswer) {
      throw new Error('La pregunta debe tener al menos una respuesta correcta.');
    }
    // --- FIN DE LA NUEVA VALIDACIÓN ---

    return new Question(id, text, media, type, timeLimit, points, answers);
  }

  public get id(): QuestionId {
    return this._id;
  }

  public get text(): QuestionText {
    return this._text;
  }

  public get media(): MediaUrl {
    return this._media;
  }

  public get type(): QuestionType {
    return this._type;
  }

  public get timeLimit(): TimeLimit {
    return this._timeLimit;
  }

  public toPlainObject() {
    return {
      id: this._id.value,
      quizId: this._quiz.value,
      text: this._text.value,
      mediaUrl: this._media.value,
      type: this._type.value,
      timeLimit: this._timeLimit.value,
      points: this._points.value,
      answers: this._answers.map((a) => a.toPlainObject()),
    };
  }
}