import { Inject, Injectable } from "@nestjs/common";
import { UserRepository } from "../domain/port/UserRepository";
import { UserId } from "../domain/valueObject/UserId";
import { BadRequestException } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";

export interface SearchParamsDto {
  q?: string;
  limit?: number;
  page?: number;
  orderBy?: string;
  order: "asc" | "desc";
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
    @Inject("UserRepository")
    private readonly userRepository: UserRepository
  ) {}

  async run(
    userheader: string,
    params: SearchParamsDto
  ): Promise<SearchResultDto> {
    const user = await this.userRepository.getOneById(new UserId(userheader));
    if (!user) {
      throw new BadRequestException("User not found");
    }
    if (!user.isAdmin) {
      throw new UnauthorizedException("Unauthorized");
    }
    const result = await this.userRepository.searchUsers(params);
    return result;
  }
}
