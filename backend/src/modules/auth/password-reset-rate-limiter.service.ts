import { Injectable } from "@nestjs/common";

@Injectable()
export class PasswordResetRateLimiter {
  private readonly blockedUntil = new Map<string, number>();

  tryConsume(email: string, ip: string, cooldownMs: number): boolean {
    const now = Date.now();
    this.removeExpiredEntries(now);

    const emailKey = `email:${email}`;
    const ipKey = `ip:${ip}`;

    if (
      (this.blockedUntil.get(emailKey) ?? 0) > now ||
      (this.blockedUntil.get(ipKey) ?? 0) > now
    ) {
      return false;
    }

    const expiresAt = now + cooldownMs;
    this.blockedUntil.set(emailKey, expiresAt);
    this.blockedUntil.set(ipKey, expiresAt);

    return true;
  }

  private removeExpiredEntries(now: number) {
    for (const [key, expiresAt] of this.blockedUntil) {
      if (expiresAt <= now) {
        this.blockedUntil.delete(key);
      }
    }
  }
}
