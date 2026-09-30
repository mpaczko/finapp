const DEFAULT_PORT = "4000";
const DEFAULT_CORS_ORIGIN = "http://localhost:5173";

export const validateEnv = (config: Record<string, unknown>) => {
  if (!config.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  if (!config.JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
  }

  return {
    ...config,
    PORT: config.PORT ?? DEFAULT_PORT,
    CORS_ORIGIN: config.CORS_ORIGIN ?? DEFAULT_CORS_ORIGIN,
    JWT_EXPIRES_IN: config.JWT_EXPIRES_IN ?? "8h",
    COOKIE_SECURE: config.COOKIE_SECURE ?? "false",
  };
};
