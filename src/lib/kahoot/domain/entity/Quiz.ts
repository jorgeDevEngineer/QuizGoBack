
import {
  QuizId,
  UserId,
  QuizTitle,
  QuizDescription,
  Visibility,
  ThemeId,
  QuizStatus,
  QuizCategory,
} from "../valueObject/Quiz";
import { Question } from "../entity/Question";
import { QuestionId } from "../valueObject/Question";
import { DomainException } from "../../../shared/exceptions/domain.exception";

export class Quiz {
  private constructor(
    private readonly _id: QuizId,
    private _authorId: UserId,
    private _title: QuizTitle,
    private _description: QuizDescription,
    private _visibility: Visibility,
    private _status: QuizStatus,
    private _category: QuizCategory,
    private _themeId: ThemeId,
    private _coverImageId: string | null, // ANTES: MediaIdVO | null
    private readonly _createdAt: Date,
    private _playCount: number,
    private _questions: Question[] = []
  ) {
    this._questions.forEach((question) => question._setQuiz(this._id));
  }

  public static create(
    id: QuizId, authorId: UserId, title: QuizTitle, description: QuizDescription,
    visibility: Visibility, status: QuizStatus, category: QuizCategory, themeId: ThemeId,
    coverImageId: string | null, questions: Question[], playCount: number = 0 // ANTES: MediaIdVO | null
  ): Quiz {
    if (questions.length === 0) {
        throw new DomainException('A quiz must have at least one question.');
    }
    const createdAt = new Date();
    return new Quiz(id, authorId, title, description, visibility, status, category, themeId, coverImageId, createdAt, playCount, questions);
  }

  public static fromDb(
    id: QuizId, authorId: UserId, title: QuizTitle, description: QuizDescription,
    visibility: Visibility, status: QuizStatus, category: QuizCategory, themeId: ThemeId,
    coverImageId: string | null, createdAt: Date, playCount: number, questions: Question[] // ANTES: MediaIdVO | null
  ): Quiz {
    return new Quiz(id, authorId, title, description, visibility, status, category, themeId, coverImageId, createdAt, playCount, questions);
  }

  public update(
    authorId: UserId, title: QuizTitle, description: QuizDescription, visibility: Visibility,
    status: QuizStatus, category: QuizCategory, themeId: ThemeId, coverImageId: string | null, // ANTES: MediaIdVO | null
    newQuestions: Question[]
  ): void {
    if (!this._authorId.equals(authorId)) {
      throw new DomainException("Only the author can update the quiz.");
    }
    this._title = title;
    this._description = description;
    this._visibility = visibility;
    this._status = status;
    this._category = category;
    this._themeId = themeId;
    this._coverImageId = coverImageId;
    this.syncQuestions(newQuestions);
  }

  private syncQuestions(newQuestions: Question[]): void {
    if (newQuestions.length === 0) {
      throw new DomainException('A quiz must have at least one question.');
    }
    const newQuestionIds = newQuestions.map(q => q.id.getValue());
    this._questions = this._questions.filter(q => newQuestionIds.includes(q.id.getValue()));
    newQuestions.forEach((newQ) => {
      const existingQuestion = this._questions.find(q => q.id.equals(newQ.id));
      if (existingQuestion) {
        existingQuestion.update(newQ.text, newQ.mediaId, newQ.type, newQ.timeLimit, newQ.points, newQ.getAnswers());
      } else {
        newQ._setQuiz(this._id);
        this._questions.push(newQ);
      }
    });
  }
  
  public get id(): QuizId { return this._id; }
  public get authorId(): UserId { return this._authorId; }
  public get themeId(): ThemeId { return this._themeId; }
  public getQuestions(): Question[] { return this._questions; }
  public getTotalQuestions(): number { return this._questions.length; }

  public getFirstQuestion(): Question {
    if(this._questions.length === 0) throw new DomainException("Quiz has no questions.");
    return this._questions[0];
  }

  public getQuestionIds(): QuestionId[] {
    return this._questions.map( question => question.id);
  }

  public getQuestionById(id: QuestionId):Question {
    const question = this._questions.find(question => question.id.equals(id));
    if (!question) throw new DomainException(`Question with id ${id.getValue()} not found in this quiz.`);
    return question;
  }

  public toPlainObject() {
    return {
      id: this._id.value,
      authorId: this._authorId.value,
      title: this._title.value,
      description: this._description.value,
      visibility: this._visibility.value,
      status: this._status.value,
      category: this._category.value,
      themeId: this._themeId.value,
      coverImageId: this._coverImageId, // ANTES: this._coverImageId ? this._coverImageId.value : null
      createdAt: this._createdAt,
      playCount: this._playCount,
      questions: this._questions.map((q) => q.toPlainObject()),
    };
  }
}
