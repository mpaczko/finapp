import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { createRemoteJWKSet, jwtVerify } from "jose";

import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { AuthUser, SupabaseJwtPayload } from "../types/auth-user";

type AuthenticatedRequest = {
  headers: Record<string, string | string[] | undefined>;
  user?: AuthUser;
};

const normalizeEnv = (value?: string) => value?.trim().replace(/^"|"$/g, "");

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private remoteJwks?: ReturnType<typeof createRemoteJWKSet>;

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

    if (normalizeEnv(this.configService.get<string>("AUTH_ENABLED")) === "false") {
      const localUserId =
        this.getHeader(request, "x-user-id") ??
        normalizeEnv(this.configService.get<string>("LOCAL_USER_ID"));

      if (!localUserId) {
        throw new UnauthorizedException("x-user-id or LOCAL_USER_ID is required when auth is disabled");
      }

      request.user = { id: localUserId };
      return true;
    }

    const token = this.extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException("Missing bearer token");
    }

    try {
      const payload = await this.verifyToken(token);

      if (!payload.sub) {
        throw new UnauthorizedException("Invalid token payload");
      }

      request.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      return true;
    } catch {
      throw new UnauthorizedException("Invalid bearer token");
    }
  }

  private extractBearerToken(request: AuthenticatedRequest): string | undefined {
    const authorization = this.getHeader(request, "authorization");
    const [type, token] = authorization?.split(" ") ?? [];

    return type === "Bearer" ? token : undefined;
  }

  private getHeader(request: AuthenticatedRequest, name: string): string | undefined {
    const value = request.headers[name.toLowerCase()];
    return Array.isArray(value) ? value[0] : value;
  }

  private async verifyToken(token: string): Promise<SupabaseJwtPayload> {
    const jwksUrl = normalizeEnv(this.configService.get<string>("SUPABASE_JWKS_URL"));

    if (jwksUrl) {
      const { payload } = await jwtVerify(token, this.getRemoteJwks(jwksUrl), {
        issuer: this.getIssuer(),
      });

      return payload as SupabaseJwtPayload;
    }

    const secret = normalizeEnv(this.configService.get<string>("SUPABASE_JWT_SECRET"));

    if (!secret) {
      throw new UnauthorizedException("SUPABASE_JWKS_URL or SUPABASE_JWT_SECRET is required");
    }

    return this.jwtService.verifyAsync<SupabaseJwtPayload>(token, {
      secret,
      algorithms: ["HS256"],
      issuer: this.getIssuer(),
    });
  }

  private getRemoteJwks(jwksUrl: string) {
    if (!this.remoteJwks) {
      this.remoteJwks = createRemoteJWKSet(new URL(jwksUrl));
    }

    return this.remoteJwks;
  }

  private getIssuer() {
    const supabaseUrl = normalizeEnv(this.configService.get<string>("SUPABASE_URL"));
    return supabaseUrl ? `${supabaseUrl}/auth/v1` : undefined;
  }
}
