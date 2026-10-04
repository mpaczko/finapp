import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter?: Transporter;

  constructor(private readonly configService: ConfigService) {}

  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
    const transporter = this.getTransporter();

    try {
      await transporter.sendMail({
        from: this.getRequiredConfig("SMTP_FROM"),
        to: email,
        subject: "Ustaw nowe hasło do Finapp",
        text: this.createPasswordResetText(resetUrl),
        html: this.createPasswordResetHtml(resetUrl),
      });
      this.logger.log("Password reset email sent");
    } catch {
      this.logger.error("Password reset email delivery failed");
      throw new ServiceUnavailableException("Unable to send password reset email");
    }
  }

  private getTransporter(): Transporter {
    if (this.transporter) {
      return this.transporter;
    }

    const host = this.getRequiredConfig("SMTP_HOST");
    const port = Number(this.configService.get<string>("SMTP_PORT") ?? "587");

    if (!Number.isInteger(port) || port < 1 || port > 65_535) {
      throw new Error("SMTP_PORT must be a valid TCP port");
    }

    const user = this.configService.get<string>("SMTP_USER");
    const password = this.configService.get<string>("SMTP_PASSWORD");

    if (Boolean(user) !== Boolean(password)) {
      throw new Error("SMTP_USER and SMTP_PASSWORD must be configured together");
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: this.configService.get<string>("SMTP_SECURE") === "true",
      ...(user && password ? { auth: { user, pass: password } } : {}),
    });

    return this.transporter;
  }

  private getRequiredConfig(key: "SMTP_HOST" | "SMTP_FROM"): string {
    const value = this.configService.get<string>(key)?.trim();

    if (!value) {
      throw new ServiceUnavailableException("Email delivery is not configured");
    }

    return value;
  }

  private createPasswordResetText(resetUrl: string) {
    return [
      "Otrzymaliśmy prośbę o ustawienie nowego hasła do Finapp.",
      "",
      `Aby ustawić nowe hasło, otwórz link: ${resetUrl}`,
      "",
      "Jeśli to nie Ty zgłosiłeś/aś reset hasła, zignoruj tę wiadomość.",
    ].join("\n");
  }

  private createPasswordResetHtml(resetUrl: string) {
    const safeResetUrl = escapeHtml(resetUrl);

    return `
      <p>Otrzymaliśmy prośbę o ustawienie nowego hasła do Finapp.</p>
      <p><a href="${safeResetUrl}">Ustaw nowe hasło</a></p>
      <p>Jeśli to nie Ty zgłosiłeś/aś reset hasła, zignoruj tę wiadomość.</p>
    `;
  }
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };

    return entities[character];
  });
