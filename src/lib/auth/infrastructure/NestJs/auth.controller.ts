import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
} from "@nestjs/common";
import { LoginCommandHandler } from "../../application/Handlers/Commands/LoginCommandHandler";
import { RegisterCommandHandler } from "../../application/Handlers/Commands/RegisterCommandHandler";
import { LogoutCommandHandler } from "../../application/Handlers/Commands/LogoutCommandHandler";
import { CheckTokenStatusQueryHandler } from "../../application/Handlers/Querys/CheckTokenStatusQueryHandler";
import { LoginCommand } from "../../application/parameterObjects/LoginCommand";
import { RegisterCommand } from "../../application/parameterObjects/RegisterCommand";
import { LogoutCommand } from "../../application/parameterObjects/LogoutCommand";
import { CheckTokenStatusQuery } from "../../application/parameterObjects/CheckTokenStatusQuery";

@Controller("auth")
export class AuthController {
  constructor(
    @Inject(LoginCommandHandler)
    private readonly loginHandler: LoginCommandHandler,
    @Inject(LogoutCommandHandler)
    private readonly logoutHandler: LogoutCommandHandler,
    @Inject(CheckTokenStatusQueryHandler)
    private readonly checkTokenHandler: CheckTokenStatusQueryHandler
  ) {}

  @Post("login")
  async login(@Body() body: { name: string; password: string }) {
    const result = await this.loginHandler.execute(
      new LoginCommand(body.name, body.password)
    );
    if (result.isFailure) {
      throw new HttpException(result.error.message, HttpStatus.UNAUTHORIZED);
    }
    return { token: result.getValue() };
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
    return { valid: result.getValue() };
  }
}
