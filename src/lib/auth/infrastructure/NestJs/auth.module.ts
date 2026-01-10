import { Module, forwardRef } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { JwtTokenProvider } from "../providers/JwtTokenProvider";
import { LoginCommandHandler } from "../../application/Handlers/Commands/LoginCommandHandler";
import { RegisterCommandHandler } from "../../application/Handlers/Commands/RegisterCommandHandler";
import { LogoutCommandHandler } from "../../application/Handlers/Commands/LogoutCommandHandler";
import { CheckTokenStatusQueryHandler } from "../../application/Handlers/Querys/CheckTokenStatusQueryHandler";
import { GetOneUserByEmailQueryHandler } from "../../../user/application/Handlers/Querys/GetOneUserByEmailQueryHandler";
import { CreateUserCommandHandler } from "../../../user/application/Handlers/Commands/CreateUserCommandHandler";
import { UserModule } from "../../../user/infrastructure/NestJS/user.module";

@Module({
  imports: [
    forwardRef(() => UserModule),
    JwtModule.register({
      secret: "your-secret-key", // TODO: move to config
      signOptions: { expiresIn: "1h" },
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: "ITokenProvider",
      useClass: JwtTokenProvider,
    },
    LoginCommandHandler,
    LogoutCommandHandler,
    CheckTokenStatusQueryHandler,
  ],
  exports: ["ITokenProvider"],
})
export class AuthModule {}
