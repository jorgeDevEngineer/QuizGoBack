
import {
  QuestionId,
  QuestionText,
  QuestionType,
  TimeLimit,
  Points,
} from "../valueObject/Question";
import { QuizId } from "../valueObject/Quiz";
import { Answer } from "../entity/Answer";

export class Question {
  private _quiz!: QuizId;

  private constructor(
    private _id: QuestionId,
    private _text: QuestionText,
    private _mediaId: string | null, // ANTES: MediaIdVO | null
    private _type: QuestionType,
    private _timeLimit: TimeLimit,
    private _points: Points,
    private _answers: Answer[]
  ) {
    this._answers.forEach((answer) => answer._setQuestion(this._id));
  }

  _setQuiz(quiz: QuizId) {
    this._quiz = quiz;
  }

  public static create(
    id: QuestionId,
    text: QuestionText,
    mediaId: string | null, // ANTES: MediaIdVO | null
    type: QuestionType,
    timeLimit: TimeLimit,
    points: Points,
    answers: Answer[]
  ): Question {
    // ... (validaciones)
    return new Question(id, text, mediaId, type, timeLimit, points, answers);
  }
  
  public update(
    text: QuestionText,
    mediaId: string | null, // ANTES: MediaIdVO | null
    type: QuestionType,
    timeLimit: TimeLimit,
    points: Points,
    newAnswers: Answer[]
  ): void {
    this._text = text;
    this._mediaId = mediaId;
    this._type = type;
    this._timeLimit = timeLimit;
    this._points = points;
    this.syncAnswers(newAnswers);
  }

  private syncAnswers(newAnswers: Answer[]): void {
    const newAnswerIds = newAnswers.map(a => a.id.getValue());
    this._answers = this._answers.filter(a => newAnswerIds.includes(a.id.getValue()));
    newAnswers.forEach(newA => {
      const existingAnswer = this._answers.find(a => a.id.equals(newA.id));
      if (!existingAnswer) {
        newA._setQuestion(this.id);
        this._answers.push(newA);
      }
    });
  }

  public get id(): QuestionId { return this._id; }
  public get text(): QuestionText { return this._text; }
  public get mediaId(): string | null { return this._mediaId; } // ANTES: MediaIdVO | null
  public get type(): QuestionType { return this._type; }
  public get timeLimit(): TimeLimit { return this._timeLimit; }
  public get points(): Points { return this._points; }
  public getAnswers(): Answer[] { return this._answers; }

  public toPlainObject() {
    return {
      id: this._id.value,
      quizId: this._quiz ? this._quiz.value : null, 
      text: this._text.value,
      mediaId: this._mediaId, // ANTES: this._mediaId ? this._mediaId.value : null
      type: this._type.value,
      timeLimit: this._timeLimit.value,
      points: this._points.value,
      answers: this._answers.map((a) => a.toPlainObject()),
    };
  }

  public toResponseDto() {
    const answers = this._answers.map( (answer, index) => {
      return {
        index: (index + 1).toString(),
        text: answer.getText() ? answer.getText().getValue() : null,
        mediaID: answer.getMediaId() // ANTES: ? answer.getMediaId().getValue() : null
      }
    });
    return {
      slideId: this._id.getValue(),
      questionType: this._type.getValue(),
      questionText: this._text.getValue(),
      timeLimitSeconds: this._timeLimit.getValue(),
      mediaId: this._mediaId, // ANTES: this._mediaId ? this._mediaId.getValue() : null
      options: answers
    }
  }
}
