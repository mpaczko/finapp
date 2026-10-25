const DEFAULT_PORT = "4000";
const DEFAULT_CORS_ORIGIN = "http://localhost:5173";

const validateCorsOrigins = (value: unknown) => {
  const origins = String(value ?? DEFAULT_CORS_ORIGIN)
    .split(",")
    .map((origin) => origin.trim());

  if (origins.length === 0 || origins.some((origin) => !origin)) {
    throw new Error("CORS_ORIGIN must contain at least one origin");
  }

  if (origins.includes("*")) {
    throw new Error(
      "CORS_ORIGIN cannot use '*' when authentication uses cookies",
    );
  }

  for (const origin of origins) {
    try {
      const url = new URL(origin);

      if (
        (url.protocol !== "http:" && url.protocol !== "https:") ||
        url.origin !== origin
      ) {
        throw new Error();
      }
    } catch {
      throw new Error("CORS_ORIGIN must contain valid HTTP(S) origins");
    }
  }

  return origins.join(",");
};

export const validateEnv = (config: Record<string, unknown>) => {
  if (!config.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  if (!config.JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
  }

  const frontendUrl = String(config.FRONTEND_URL ?? DEFAULT_CORS_ORIGIN);

  try {
    const url = new URL(frontendUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error();
    }
  } catch {
    throw new Error("FRONTEND_URL must be a valid HTTP(S) URL");
  }

  const passwordResetTtlMinutes = getPositiveWholeNumber(
    config.PASSWORD_RESET_TTL_MINUTES ?? "30",
    "PASSWORD_RESET_TTL_MINUTES",
  );
  const passwordResetRateLimitMinutes = getPositiveWholeNumber(
    config.PASSWORD_RESET_RATE_LIMIT_MINUTES ?? "5",
    "PASSWORD_RESET_RATE_LIMIT_MINUTES",
  );

  return {
    ...config,
    PORT: config.PORT ?? DEFAULT_PORT,
    CORS_ORIGIN: validateCorsOrigins(config.CORS_ORIGIN),
    JWT_EXPIRES_IN: config.JWT_EXPIRES_IN ?? "8h",
    COOKIE_SECURE: config.COOKIE_SECURE ?? "false",
    FRONTEND_URL: frontendUrl,
    PASSWORD_RESET_TTL_MINUTES: passwordResetTtlMinutes,
    PASSWORD_RESET_RATE_LIMIT_MINUTES: passwordResetRateLimitMinutes,
  };
};

const getPositiveWholeNumber = (value: unknown, key: string) => {
  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue < 1) {
    throw new Error(`${key} must be a positive whole number`);
  }

  return String(numberValue);
};
