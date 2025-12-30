import { IHandler } from 'src/lib/shared/IHandler';
import { GetCompletedQuizSummary } from '../Parameter Objects/GetCompletedQuizSummary';
import { GetCompletedQuizSummaryDomainService } from '../../domain/services/GetCompletedQuizSummaryDomainService';
import { QuizPersonalResult, toQuizPersonalResult } from '../../application/Response Types/QuizPersonalResult';
import { DomainException } from 'src/lib/shared/exceptions/DomainException';
import { DomainUnexpectedException } from 'src/lib/shared/exceptions/DomainUnexpectedException';
import { Either } from 'src/lib/shared/Type Helpers/Either';

export class GetCompletedQuizSummaryQueryHandler implements IHandler <GetCompletedQuizSummary, Either<DomainException, QuizPersonalResult>> {
    constructor(
        private getCompletedQuizSummaryDomainService: GetCompletedQuizSummaryDomainService
    ) {}

    async execute(command: GetCompletedQuizSummary): Promise<Either<DomainException, QuizPersonalResult>> {
        const gameId = command.gameId

        try {
            const data = await this.getCompletedQuizSummaryDomainService.execute(gameId);
            if(data.isLeft()){
                return Either.makeLeft(data.getLeft());
            }
            const { game, quiz } = data.getRight();
            const result = toQuizPersonalResult(quiz, game);
            return Either.makeRight(result);
        } catch (error) {
            return Either.makeLeft(new DomainUnexpectedException(error.message));
        }
    }
}

