import { IHandler } from 'src/lib/shared/IHandler';
import { GetUserResults } from '../Parameter Objects/GetUserResults';
import { CompletedQuizResponse } from '../../application/Response Types/CompletedQuizResponse';
import { DomainException } from 'src/lib/shared/exceptions/DomainException';
import { DomainUnexpectedException } from 'src/lib/shared/exceptions/DomainUnexpectedException';
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";; 
import { GetUserResultsDomainService } from '../../domain/services/GetUserResultsDomainService';
import { Either } from 'src/lib/shared/Type Helpers/Either';
import { Injectable } from '@nestjs/common';
import { CompletedQuizQueryParamsDTO } from '../DTOs/CompletedQuizQueryParams';

@Injectable()
export class GetUserResultsQueryHandler implements IHandler <GetUserResults, Either<DomainException, CompletedQuizResponse[]>> {
    constructor(
        private getUserResultsDomainService: GetUserResultsDomainService
    ) {}

    public async execute(
        command: GetUserResults
    ): Promise<Either<DomainException, CompletedQuizResponse[]>> {
        const userId = UserId.of(command.userId);
        const queryParamsDTO = new CompletedQuizQueryParamsDTO(command.criteria);
        const criteria = queryParamsDTO.toCriteria();

        try {
            const result = await this.getUserResultsDomainService.execute(userId, criteria);
            return result;
        } catch (error) {
            return Either.makeLeft(new DomainUnexpectedException(error.message));
        }
    }
}