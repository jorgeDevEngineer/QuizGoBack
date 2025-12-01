
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
import { MediaId as MediaIdVO } from '../../../media/domain/valueObject/Media';
import { Question } from "../entity/Question";

export class Quiz {
  private constructor(
    private readonly _id: QuizId,
    private _authorId: UserId,
    private _title: QuizTitle | null,
    private _description: QuizDescription | null,
    private _visibility: Visibility,
    private _status: QuizStatus,
    private _category: QuizCategory | null,
    private _themeId: ThemeId,
    private _coverImageId: MediaIdVO | null,
    private readonly _createdAt: Date,
    private _playCount: number,
    private _questions: Question[] = []
  ) {
    this._questions.forEach((question) => question._setQuiz(this._id));
  }

  public get id(): QuizId {
    return this._id;
  }

  public static create(
    id: QuizId,
    authorId: UserId,
    title: QuizTitle | null,
    description: QuizDescription | null,
    visibility: Visibility,
    status: QuizStatus,
    category: QuizCategory | null,
    themeId: ThemeId,
    coverImageId: MediaIdVO | null,
    questions: Question[],
    playCount: number = 0
  ): Quiz {
    const createdAt = new Date();
    return new Quiz(
      id,
      authorId,
      title,
      description,
      visibility,
      status,
      category,
      themeId,
      coverImageId,
      createdAt,
      playCount,
      questions
    );
  }

  public static fromDb(
    id: QuizId,
    authorId: UserId,
    title: QuizTitle | null,
    description: QuizDescription | null,
    visibility: Visibility,
    status: QuizStatus,
    category: QuizCategory | null,
    themeId: ThemeId,
    coverImageId: MediaIdVO | null,
    createdAt: Date,
    playCount: number,
    questions: Question[]
  ): Quiz {
    return new Quiz(
      id,
      authorId,
      title,
      description,
      visibility,
      status,
      category,
      themeId,
      coverImageId,
      createdAt,
      playCount,
      questions
    );
  }

  public updateMetadata(
    title: QuizTitle | null,
    description: QuizDescription | null,
    visibility: Visibility,
    status: QuizStatus,
    category: QuizCategory | null,
    themeId: ThemeId,
    coverImageId: MediaIdVO | null
  ): void {
    this._title = title;
    this._description = description;
    this._visibility = visibility;
    this._status = status;
    this._category = category;
    this._themeId = themeId;
    this._coverImageId = coverImageId;
  }

  public replaceQuestions(newQuestions: Question[]): void {
    newQuestions.forEach((q) => q._setQuiz(this._id));
    this._questions = newQuestions;
  }

  public get authorId(): UserId {
    return this._authorId;
  }

  public get themeId(): ThemeId {
    return this._themeId;
  }

  public toPlainObject() {
    return {
      id: this._id.value,
      authorId: this._authorId.value,
      title: this._title ? this._title.value : null,
      description: this._description ? this._description.value : null,
      visibility: this._visibility.value,
      status: this._status.value,
      category: this._category ? this._category.value : null,
      themeId: this._themeId.value,
      coverImageId: this._coverImageId ? this._coverImageId.value : null,
      createdAt: this._createdAt,
      playCount: this._playCount,
      questions: this._questions.map((q) => q.toPlainObject()),
    };
  }
}
