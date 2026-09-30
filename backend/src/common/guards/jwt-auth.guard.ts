import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";

import { SESSION_COOKIE, LocalJwtPayload } from "../auth/session";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { AuthUser } from "../types/auth-user";

type AuthenticatedRequest = {
  cookies?: Record<string, string | undefined>;
  user?: AuthUser;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.cookies?.[SESSION_COOKIE];

    if (!token) {
      throw new UnauthorizedException("Missing session cookie");
    }

    try {
      const payload = await this.jwtService.verifyAsync<LocalJwtPayload>(token, {
        secret: this.configService.getOrThrow<string>("JWT_SECRET"),
      });

      if (!payload.sub) {
        throw new UnauthorizedException("Invalid session payload");
      }

      request.user = {
        id: payload.sub,
        email: payload.email,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException("Invalid or expired session");
    }
  }
}
