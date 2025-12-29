
import { AnswerId, AnswerText, IsCorrect} from "../valueObject/Answer";
import { MediaId as MediaIdVO } from '../../../media/domain/valueObject/Media';
import { QuestionId } from "../valueObject/Question";
import { DomainException } from "../../../shared/exceptions/domain.exception";

export class Answer {
  private _question!: QuestionId;

  private constructor(
    private readonly _id: AnswerId,
    private readonly _isCorrect: IsCorrect,
    private readonly _text: AnswerText | null,
    private readonly _mediaId: MediaIdVO | null
  ) {}

  _setQuestion(question: QuestionId) {
    this._question = question;
  }

  public static createTextAnswer(
    id: AnswerId,
    text: AnswerText | null,
    isCorrect: IsCorrect
  ): Answer {
    if (!text) {
      throw new DomainException('Text-based answer must have text.');
    }
    return new Answer(id, isCorrect, text, null);
  }

  public static createMediaAnswer(
    id: AnswerId,
    mediaId: MediaIdVO | null, 
    isCorrect: IsCorrect
  ): Answer {
    if (!mediaId) {
      throw new DomainException('Media-based answer must have a mediaId.');
    }
    return new Answer(id, isCorrect, null, mediaId);
  } 

  public get id(): AnswerId {
    return this._id;
  }
  public get isCorrect(): IsCorrect {
    return this._isCorrect;
  }

  public toPlainObject() {
    return {
      id: this._id.value,
      questionId: this._question.value,
      text: this._text ? this._text.value : null,
      mediaId: this._mediaId ? `${process.env.BASE_URL}/media/${this._mediaId.value}` : null,
      isCorrect: this._isCorrect.value,
    };
  }

  public getText(): AnswerText | null {
    return this._text;
  }

  public getMediaId(): MediaIdVO | null{
    return this._mediaId;
  }
  
}
