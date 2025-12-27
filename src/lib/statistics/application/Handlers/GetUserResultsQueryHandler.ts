import { IHandler } from 'src/lib/shared/IHandler';
import { GetUserResults } from '../Parameter Objects/GetUserResults';
import { CompletedQuizResponse, toSingleCompletedQuizResponse} from '../Response Types/CompletedQuizResponse';
import { QueryWithPaginationResponse } from '../../application/Response Types/QueryWithPaginationResponse';
import { DomainException } from 'src/lib/shared/exceptions/DomainException';
import { DomainUnexpectedException } from 'src/lib/shared/exceptions/DomainUnexpectedException';
import { GetUserResultsDomainService } from '../../domain/services/GetUserResultsDomainService';
import { Either } from 'src/lib/shared/Type Helpers/Either';
import { Injectable } from '@nestjs/common';
import { CompletedQuizQueryParamsDTO } from '../DTOs/CompletedQuizQueryParams';

@Injectable()
export class GetUserResultsQueryHandler implements IHandler <GetUserResults, Either<DomainException, QueryWithPaginationResponse<CompletedQuizResponse>>> {
    constructor(
        private getUserResultsDomainService: GetUserResultsDomainService
    ) {}

    public async execute(
        command: GetUserResults
    ): Promise<Either<DomainException, QueryWithPaginationResponse<CompletedQuizResponse>>> {
        const userId = command.userId;
        const queryParamsDTO = new CompletedQuizQueryParamsDTO(command.criteria);
        const criteria = queryParamsDTO.toCriteria();

        try {
            const data = await this.getUserResultsDomainService.execute(userId, criteria);
            if(data.isLeft()){
                return Either.makeLeft(data.getLeft());
            }

            const { games, quizzes, totalGames } = data.getRight();
            const gameData:CompletedQuizResponse[] = games.flatMap(game => {
                const quiz = quizzes.find(q => q.id.value === game.getQuizId().value);
                if(!quiz) return [];
                return [toSingleCompletedQuizResponse(game, quiz)];
            }) 
            const answer: QueryWithPaginationResponse<CompletedQuizResponse> = {
                results: gameData,
                pagination: {
                    totalItems: totalGames,
                    currentPage: criteria.page,
                    totalPages: Math.ceil(totalGames / criteria.limit),
                    limit: criteria.limit
                }
            }
            return Either.makeRight(answer);
        } catch (error) {
            return Either.makeLeft(new DomainUnexpectedException(error.message));
        }
    }
}