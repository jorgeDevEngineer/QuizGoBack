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
import { GetOneUserByEmail } from "src/lib/user/application/Parameter Objects/GetOneUserByEmail";
import { GetOneUserByEmailQueryHandler } from "src/lib/user/application/Handlers/Querys/GetOneUserByEmailQueryHandler";
import { In } from "typeorm";
import { GetOneUserByIdQueryHandler } from "src/lib/user/application/Handlers/Querys/GetOneUserByIdQueryHandler";
import { GetOneUserById } from "src/lib/user/application/Parameter Objects/GetOneUserById";
import { ITokenProvider } from "../../application/providers/ITokenProvider";

@Controller("auth")
export class AuthController {
  constructor(
    @Inject(LoginCommandHandler)
    private readonly loginHandler: LoginCommandHandler,
    @Inject(LogoutCommandHandler)
    private readonly logoutHandler: LogoutCommandHandler,
    @Inject(CheckTokenStatusQueryHandler)
    private readonly checkTokenHandler: CheckTokenStatusQueryHandler,
    @Inject(GetOneUserByEmailQueryHandler)
    private readonly getUserByEmailHandler: GetOneUserByEmailQueryHandler,
    @Inject(GetOneUserByIdQueryHandler)
    private readonly getUserByIdHandler: GetOneUserByIdQueryHandler,
    @Inject("ITokenProvider") private readonly tokenProvider: ITokenProvider
  ) {}

  @Post("login")
  async login(@Body() body: { email: string; password: string }) {
    const result = await this.loginHandler.execute(
      new LoginCommand(body.email, body.password)
    );
    if (result.isFailure) {
      throw new HttpException(result.error.message, HttpStatus.UNAUTHORIZED);
    }
    const user = await this.getUserByEmailHandler.execute(
      new GetOneUserByEmail(body.email)
    );
    return { token: result.getValue(), user: user.getValue().toPlainObject() };
  }

  @Post("logout")
  async logout(@Headers("authorization") auth: string) {
    const token = auth?.replace(/^Bearer\s+/i, "");
    if (!token) {
      throw new HttpException("Token required", HttpStatus.BAD_REQUEST);
    }
    const result = await this.logoutHandler.execute(new LogoutCommand(token));
    if (result.isFailure) {
      throw new HttpException(result.error.message, HttpStatus.BAD_REQUEST);
    }
    return { message: "Logged out successfully" };
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
    if (!decodedToken) {
      return { valid: false, user: null };
    } else {
      const user = await this.getUserByIdHandler.execute(
        new GetOneUserById(decodedToken.sub)
      );
      if (user.isFailure) {
        throw new HttpException("User not found", HttpStatus.NOT_FOUND);
      }
      return {
        valid: result.getValue() === true,
        user: user.getValue().toPlainObject(),
      };
    }
  }
}
