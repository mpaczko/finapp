import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { MailModule } from "../mail/mail.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PasswordResetRateLimiter } from "./password-reset-rate-limiter.service";

@Module({
  imports: [JwtModule.register({}), MailModule],
  controllers: [AuthController],
  providers: [AuthService, PasswordResetRateLimiter],
  exports: [AuthService],
})
export class AuthModule {}
