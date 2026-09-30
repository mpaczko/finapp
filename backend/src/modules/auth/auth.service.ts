import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { Prisma } from "@prisma/client";
import type { StringValue } from "ms";

import { SESSION_COOKIE } from "../../common/auth/session";
import { PrismaService } from "../../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

export type AuthenticatedUser = {
  id: string;
  email: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthenticatedUser> {
    const email = this.normalizeEmail(dto.email);
    const passwordHash = await argon2.hash(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
        },
      });

      return this.toAuthenticatedUser(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictException("An account with this email already exists");
      }

      throw error;
    }
  }

  async validateCredentials(dto: LoginDto): Promise<AuthenticatedUser> {
    const email = this.normalizeEmail(dto.email);
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    const passwordMatches = user
      ? await argon2.verify(user.passwordHash, dto.password).catch(() => false)
      : false;

    if (!user || !passwordMatches) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (user.mustResetPassword) {
      throw new ForbiddenException("Password reset is required for this account");
    }

    return this.toAuthenticatedUser(user);
  }

  async getUserById(id: string): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid session user");
    }

    return this.toAuthenticatedUser(user);
  }

  async createSession(user: AuthenticatedUser): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
      },
      {
        secret: this.configService.getOrThrow<string>("JWT_SECRET"),
        expiresIn: this.getSessionDuration(),
      },
    );
  }

  getSessionCookieOptions() {
    return {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: this.configService.get<string>("COOKIE_SECURE") === "true",
      maxAge: this.getSessionDurationMs(),
      path: "/",
    };
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private getSessionDuration(): StringValue {
    return this.configService.getOrThrow<string>("JWT_EXPIRES_IN") as StringValue;
  }

  private getSessionDurationMs() {
    const duration = this.getSessionDuration().trim();
    const match = /^(\d+)([smhd])$/.exec(duration);

    if (!match) {
      throw new Error("JWT_EXPIRES_IN must use s, m, h, or d units");
    }

    const [, amount, unit] = match;
    const multiplier = {
      s: 1_000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    }[unit];

    if (!multiplier) {
      throw new Error("JWT_EXPIRES_IN must use s, m, h, or d units");
    }

    return Number(amount) * multiplier;
  }

  private toAuthenticatedUser(user: { id: string; email: string }): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
    };
  }
}
