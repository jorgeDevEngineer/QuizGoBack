// Importamos todos los VOs necesarios
import { AnswerId, AnswerText, IsCorrect} from '../valueObject/Answer';
import { MediaId as MediaIdVO } from '../../../media/domain/value-object/MediaId';
import { QuestionId } from "../valueObject/Question";

export class Answer {
  private _question!: QuestionId;

  private constructor(
    private readonly _id: AnswerId,
    private readonly _isCorrect: IsCorrect,
    // Propiedades opcionales (nulables)
    private readonly _text: AnswerText | null,
    private readonly _mediaId: MediaIdVO | null
  ) {
  }

  /**
   * Asigna la pregunta padre a esta respuesta.
   * Este método solo debe ser llamado por el constructor de Question.
   * @param question La instancia de la pregunta padre.
   */
  _setQuestion(question: QuestionId) {
    this._question = question;
  }

  /**
   * Método de factoría para crear una respuesta basada en TEXTO.
   */

  public static createTextAnswer(
    id: AnswerId,
    text: AnswerText,
    isCorrect: IsCorrect
  ): Answer {
    // El constructor validará que 'media' sea 'null'
    return new Answer(id, isCorrect, text, null);
  }
  /**
   * Método de factoría para crear una respuesta basada en MEDIA (imagen).
   */

  public static createMediaAnswer(
    id: AnswerId,
    mediaId: MediaIdVO | null, 
    isCorrect: IsCorrect
  ): Answer {
    // El constructor validará que 'text' sea 'null'
    return new Answer(id, isCorrect, null, mediaId);
  } // --- Getters (para acceder a los valores de forma segura) ---

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
      mediaId: this._mediaId ? this._mediaId.getId() : null,
      isCorrect: this._isCorrect.value,
    };
  }
}
