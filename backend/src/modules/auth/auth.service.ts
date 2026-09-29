import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import * as argon2 from "argon2";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

export type AuthenticatedUser = {
  id: string;
  email: string;
};

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

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

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private toAuthenticatedUser(user: { id: string; email: string }): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
    };
  }
}
