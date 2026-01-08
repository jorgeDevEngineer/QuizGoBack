import { Inject } from "@nestjs/common";
import { IHandler } from "src/lib/shared/IHandler";
import { CreateSessionCommand } from "../parameterObjects/CreateSessionCommand";
import { CreateSessionResponseDto } from "../responseDtos/CreateSessionResponse.dto";
import { QuizRepository } from "src/lib/kahoot/domain/port/QuizRepository";
import { TypeOrmQuizRepository } from "src/lib/kahoot/infrastructure/TypeOrm/TypeOrmQuizRepository";
import { UuidGenerator } from "src/lib/shared/domain/ports/UuuidGenerator";
import { CryptoUuidGenerator } from "src/lib/shared/infrastructure/adapters/CryptoUuidGenerator";
import { IActiveMultiplayerSessionRepository } from "../../domain/repositories/IActiveMultiplayerSessionRepository";
import { InMemoryActiveSessionRepository } from "../../infrastructure/repositories/ActiveMultiplayerSessionRepository";
import { IGeneratePinService } from "../../domain/services/IGeneratePinService";
import { CryptoGeneratePinService } from "../../infrastructure/adapters/CryptoGeneratePin";
import { QuizId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { MultiplayerSessionId } from "src/lib/shared/domain/ids";
import { MultiplayerSessionFactory } from "../../domain/factories/MultiplayerSessionFactory";

export class CreateSessionCommandHandler implements IHandler<CreateSessionCommand, CreateSessionResponseDto> {

    constructor(
        @Inject( InMemoryActiveSessionRepository )
        private readonly sessionRepository: IActiveMultiplayerSessionRepository,

        @Inject( TypeOrmQuizRepository )
        private readonly kahootRepository: QuizRepository,

        @Inject( CryptoUuidGenerator )
        private readonly uuidGenerator: UuidGenerator,

        @Inject( CryptoGeneratePinService )
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

        return {
            sessionPin: pin,
            qrToken: qrToken,
            quizTitle: quiz.getTitle(),
            coverImageUrl: quiz.getCoverImageId(),
            theme: null, //Por ahora no está implementado
        }
        
    }

}