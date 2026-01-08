import { Inject, Injectable } from "@nestjs/common";
import { UserRepository } from "../domain/port/UserRepository";


export interface SearchParamsDto {
    q?: string,
    limit?: number,
    page?: number,
    orderBy?: string,
    order: 'asc' | 'desc'
}

export interface SearchResultDto {
    data: {
        id: string;
        name: string;
        email: string;
        userType: string;
        createdAt: Date;
        status: string;
    }[]; 
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
    };
  }

@Injectable()
export class SearchUsersUseCase {
    constructor(
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,
    ) {}

    async run(params: SearchParamsDto): Promise<SearchResultDto> {
        const result = await this.userRepository.searchUsers(params);
        return result;
    }
}