import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res } from "@nestjs/common";
import { Response } from "express";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { AuthUser } from "../../common/types/auth-user";
import { SESSION_COOKIE } from "../../common/auth/session";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const user = await this.authService.register(dto);
    const session = await this.authService.createSession(user);

    response.cookie(SESSION_COOKIE, session, this.authService.getSessionCookieOptions());

    return { user };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const user = await this.authService.validateCredentials(dto);
    const session = await this.authService.createSession(user);

    response.cookie(SESSION_COOKIE, session, this.authService.getSessionCookieOptions());

    return { user };
  }

  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post("logout")
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(SESSION_COOKIE, this.authService.getSessionCookieOptions());
  }

  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post("reset-password")
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);
  }

  @Get("me")
  me(@CurrentUser() user: AuthUser) {
    return this.authService.getUserById(user.id);
  }
}
