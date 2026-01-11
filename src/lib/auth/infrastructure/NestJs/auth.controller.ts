import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Get,
} from "@nestjs/common";
import { LoginCommandHandler } from "../../application/Handlers/Commands/LoginCommandHandler";
import { RegisterCommandHandler } from "../../application/Handlers/Commands/RegisterCommandHandler";
import { LogoutCommandHandler } from "../../application/Handlers/Commands/LogoutCommandHandler";
import { CheckTokenStatusQueryHandler } from "../../application/Handlers/Querys/CheckTokenStatusQueryHandler";
import { LoginCommand } from "../../application/parameterObjects/LoginCommand";
import { RegisterCommand } from "../../application/parameterObjects/RegisterCommand";
import { LogoutCommand } from "../../application/parameterObjects/LogoutCommand";
import { CheckTokenStatusQuery } from "../../application/parameterObjects/CheckTokenStatusQuery";
import { GetOneUserByUserName } from "src/lib/user/application/Parameter Objects/GetOneUserByUserName";
import { GetOneUserByUserNameQueryHandler } from "src/lib/user/application/Handlers/Querys/GetOneUserByUserNameQueryHandler";
import { In } from "typeorm";
import { GetOneUserByIdQueryHandler } from "src/lib/user/application/Handlers/Querys/GetOneUserByIdQueryHandler";
import { GetOneUserById } from "src/lib/user/application/Parameter Objects/GetOneUserById";
import { ITokenProvider } from "../../application/providers/ITokenProvider";
import { IAssetUrlResolver } from "src/lib/shared/application/providers/IAssetUrlResolver";

@Controller("auth")
export class AuthController {
  constructor(
    @Inject(LoginCommandHandler)
    private readonly loginHandler: LoginCommandHandler,
    @Inject(LogoutCommandHandler)
    private readonly logoutHandler: LogoutCommandHandler,
    @Inject(CheckTokenStatusQueryHandler)
    private readonly checkTokenHandler: CheckTokenStatusQueryHandler,
    @Inject(GetOneUserByUserNameQueryHandler)
    private readonly getUserByUserNameHandler: GetOneUserByUserNameQueryHandler,
    @Inject(GetOneUserByIdQueryHandler)
    private readonly getUserByIdHandler: GetOneUserByIdQueryHandler,
    @Inject("ITokenProvider") private readonly tokenProvider: ITokenProvider,
    @Inject("IAssetUrlResolver")
    private readonly assetUrlResolver: IAssetUrlResolver
  ) {}

  private mapUserToResponse(user: any) {
    return {
      id: user.id.value,
      email: user.email.value,
      username: user.userName.value,
      type: user.userType.value,
      state: user.status.value,
      preferences: { theme: user.theme.value },
      userProfileDetails: {
        name: user.name.value,
        description: user.description.value,
        avatarAssetUrl: this.assetUrlResolver.resolveAvatarUrl(
          user.avatarAssetId.value
        ),
      },
      isPremium: user.membership.isPremium(),
    };
  }

  @Post("login")
  async login(@Body() body: { username: string; password: string }) {
    const result = await this.loginHandler.execute(
      new LoginCommand(body.username, body.password)
    );
    if (result.isFailure) {
      throw new HttpException(result.error.message, HttpStatus.UNAUTHORIZED);
    }
    const user = await this.getUserByUserNameHandler.execute(
      new GetOneUserByUserName(body.username)
    );
    return {
      token: result.getValue(),
      user: this.mapUserToResponse(user.getValue()),
    };
  }

  @Post("check-status")
  async checkStatus(@Headers("authorization") auth: string) {
    const token = auth?.replace(/^Bearer\s+/i, "");
    if (!token) {
      throw new HttpException("Token required", HttpStatus.BAD_REQUEST);
    }
    const result = await this.checkTokenHandler.execute(
      new CheckTokenStatusQuery(token)
    );
    if (result.isFailure) {
      throw new HttpException(
        result.error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    const decodedToken = await this.tokenProvider.validateToken(token);
    if (!decodedToken || !decodedToken.id) {
      throw new HttpException("Invalid token", HttpStatus.UNAUTHORIZED);
    }
    const userResult = await this.getUserByIdHandler.execute(
      new GetOneUserById(decodedToken.id)
    );
    if (userResult.isFailure) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }
    const user = userResult.getValue();
    const newToken = await this.tokenProvider.generateToken({
      sub: user.id.value,
      email: user.email.value,
      roles: user.roles.value,
    });
    return { token: newToken, user: this.mapUserToResponse(user) };
  }
}
