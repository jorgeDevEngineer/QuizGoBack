import { Inject } from "@nestjs/common";
import { IHandler } from "src/lib/shared/IHandler";
import { CreateSessionCommand } from "../parameterObjects/CreateSessionCommand";
import { CreateSessionResponseDto } from "../responseDtos/CreateSessionResponse.dto";
import { QuizRepository } from "src/lib/kahoot/domain/port/QuizRepository";
import { UuidGenerator } from "src/lib/shared/domain/ports/UuuidGenerator";
import { IActiveMultiplayerSessionRepository } from "../../domain/repositories/IActiveMultiplayerSessionRepository";
import { IGeneratePinService } from "../../domain/services/IGeneratePinService";
import { QuizId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { MultiplayerSessionId } from "src/lib/shared/domain/ids";
import { MultiplayerSessionFactory } from "../../domain/factories/MultiplayerSessionFactory";

export class CreateSessionCommandHandler implements IHandler<CreateSessionCommand, CreateSessionResponseDto> {

    private readonly DEFAULT_COVER_IMAGE = 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

    constructor(
        @Inject( 'IActiveMultiplayerSessionRepository' )
        private readonly sessionRepository: IActiveMultiplayerSessionRepository,

        @Inject( 'QuizRepository' )
        private readonly kahootRepository: QuizRepository,

        @Inject( 'UuidGenerator' )
        private readonly uuidGenerator: UuidGenerator,

        @Inject( 'IGeneratePinService' )
        private readonly pinGenerator: IGeneratePinService,
    ){}

    async execute(command: CreateSessionCommand): Promise<CreateSessionResponseDto> {

        const quiz = await this.kahootRepository.find(QuizId.of(command.kahootId));
        if (!quiz) {
            throw new Error(`No se encontró el kahoot de id ${command.kahootId}`);
        }

        const hostId = command.hostId;

        if (quiz.isDraft()){
            throw new Error(`No se puede jugar un Kahoot en Draft`);
        }
        if  (quiz.isPrivate() && !(command.hostId === quiz.authorId.getValue()) ){
            throw new Error(`El kahoot es privado por lo que solo puede hostearlo su creador`);
        }

        const sessionId = MultiplayerSessionId.generate(this.uuidGenerator);

        const pin = await this.pinGenerator.generateUniquePin();

        const session = MultiplayerSessionFactory.createMultiplayerSession(
            quiz,
            hostId,
            sessionId.getId(),
            pin, 
        )

        const qrToken = await this.sessionRepository.saveSession({
            session,
            quiz
        });

        const coverImageUrl = quiz.getCoverImageId() ?? this.DEFAULT_COVER_IMAGE;

        return {
            sessionPin: pin,
            qrToken: qrToken,
            quizTitle: quiz.getTitle(),
            coverImageUrl: coverImageUrl,
            theme: null, //Por ahora no está implementado
        }
        
    }

}