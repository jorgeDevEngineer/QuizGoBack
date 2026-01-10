import { Quiz } from "src/lib/kahoot/domain/entity/Quiz";
import { MultiplayerSession } from "../../domain/aggregates/MultiplayerSession";
import { OptionWithoutAnswers } from "../responseDtos/types/QuestionWithoutAnswers.interface";
import { QuestionWithoutAnswers } from "../responseDtos/types/QuestionWithoutAnswers.interface";
import { Question } from "src/lib/kahoot/domain/entity/Question";
import { HostNextPhaseType } from "../responseDtos/enums/HostNextPhaseType.enum";
import { QuestionStartedResponseDto } from "../responseDtos/QuestionStartedResponse.dto";
import { COMMON_ERRORS } from "../handlers/Errors/CommonErrors";
import { QuestionTypeValue } from "src/lib/kahoot/domain/valueObject/Question";

export const MapToQuestionResponse = async ( session: MultiplayerSession, quiz: Quiz): Promise<QuestionStartedResponseDto> => {
    
    const currentQuestionId = session.getCurrentQuestionInSession(); 

    let currentQuestion: Question;
    try {
        currentQuestion = quiz.getQuestionById(currentQuestionId);
    } catch (error) {
        // No debería ocurrir dado que el session se basa en un kahoot existente que de paso nos aseguramos que no esté en DRAFT
        // dejo la protección por si acaso y porque TS la exige
        throw new Error(COMMON_ERRORS.SLIDE_NOT_FOUND);
    }
    
    const answers = currentQuestion.getAnswers();
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
        throw new Error(COMMON_ERRORS.NO_OPTIONS);
    }

    const currentQuestionPosition = quiz.getQuestionPosition(currentQuestion.id);

    const currentQuestionWithouthAnswers: QuestionWithoutAnswers = {
        id: currentQuestion.id.getValue(),
        position: currentQuestionPosition,    
        slideType: currentQuestion.type.getValue() as QuestionTypeValue, 
        timeLimitSeconds: currentQuestion.timeLimit.getValue(), 
        //Opcionales
        questionText: currentQuestion.text ? currentQuestion.text.getValue() : undefined, 
        slideImageURL: currentQuestion.mediaId ? currentQuestion.mediaId : undefined, 
        pointsValue: currentQuestion.points ? currentQuestion.points.getValue() : undefined, 
        descriptionText: undefined, //Nuestro back no tiene esto
        options: undefined, // Se asigna más abajo
    }

    const Options = answers.map( ( option, index ) : OptionWithoutAnswers => (
        { 
            index: index.toString(),
            text: option.getText() ? option.getText().getValue() : undefined,
            mediaURL: option.getMediaId() ? option.getMediaId() : undefined,
        }
    ))

    currentQuestionWithouthAnswers.options = Options;

    return {
        type: HostNextPhaseType.QUESTION_STARTED,
        data: {
            state: session.getSessionStateType(),
            // questionIndex: session.getCurrentSlideIndex(),
            currentSlideData: currentQuestionWithouthAnswers
        }
    };

}