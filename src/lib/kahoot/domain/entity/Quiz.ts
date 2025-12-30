
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
    private _coverImageId: MediaIdVO | null,
    private readonly _createdAt: Date,
    private _playCount: number,
    private _questions: Question[] = []
  ) {
    // Asignamos la referencia de este quiz (this) a cada una de sus preguntas.
    this._questions.forEach((question) => question._setQuiz(this._id));
  }

  public get id(): QuizId {
    return this._id;
  }

  public getQuestions(): Question[]{
    return this._questions;
  }

  // El método de factoría ahora exige los Value Objects correctos.
  public static create(
    id: QuizId,
    authorId: UserId,
    title: QuizTitle,
    description: QuizDescription,
    visibility: Visibility,
    status: QuizStatus,
    category: QuizCategory,
    themeId: ThemeId,
    coverImageId: MediaIdVO | null,
    questions: Question[],
    playCount: number = 0
  ): Quiz {
    if (questions.length === 0) {
        throw new DomainException('A quiz must have at least one question.');
    }
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
    title: QuizTitle,
    description: QuizDescription,
    visibility: Visibility,
    status: QuizStatus,
    category: QuizCategory,
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
    title: QuizTitle,
    description: QuizDescription,
    visibility: Visibility,
    status: QuizStatus,
    category: QuizCategory,
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
    if (newQuestions.length === 0) {
        throw new DomainException('A quiz must have at least one question.');
    }
    // Asignamos el ID de este quiz a las nuevas preguntas para mantener la referencia
    newQuestions.forEach((q) => q._setQuiz(this._id));

    // Reemplazamos el array
    this._questions = newQuestions;
  }

  public get authorId(): UserId {
    return this._authorId;
  }

  public get themeId(): ThemeId {
    return this._themeId;
  }

  public getTotalQuestions(){
    return this._questions.length;
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
      coverImageId: this._coverImageId ? this._coverImageId.value : null,
      createdAt: this._createdAt,
      playCount: this._playCount,
      questions: this._questions.map((q) => q.toPlainObject()),
    };
  }

  public getFirstQuestion(): Question {
    if(this._questions.length === 0){
        throw new DomainException("Quiz has no questions.");
    }
    return this._questions[0];
  }

  public getQuestionIds(): QuestionId[] {
    return this._questions.map( question => question.id);
  }

  public getQuestionById(id: QuestionId):Question {
    const question: Question = this._questions.find(question => question.id.equals(id))
    if (!question){
      throw new DomainException(`Question with id ${id.getValue()} not found in this quiz.`);
    }
    return question;
  }

}
