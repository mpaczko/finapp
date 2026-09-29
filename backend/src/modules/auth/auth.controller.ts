import { Body, Controller, Get, HttpCode, HttpStatus, Post } from "@nestjs/common";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { AuthUser } from "../../common/types/auth-user";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.validateCredentials(dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post("logout")
  logout() {
    // Session cookie removal is added in step 6.
  }

  @Get("me")
  me(@CurrentUser() user: AuthUser) {
    return this.authService.getUserById(user.id);
  }
}
