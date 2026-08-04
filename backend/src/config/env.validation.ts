const DEFAULT_PORT = "4000";
const DEFAULT_CORS_ORIGIN = "http://localhost:5173";

export const validateEnv = (config: Record<string, unknown>) => {
  const authEnabled = config.AUTH_ENABLED !== "false";

  if (!config.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  if (authEnabled && !config.SUPABASE_JWKS_URL && !config.SUPABASE_JWT_SECRET) {
    throw new Error("SUPABASE_JWKS_URL or SUPABASE_JWT_SECRET is required when AUTH_ENABLED is true");
  }

  return {
    ...config,
    PORT: config.PORT ?? DEFAULT_PORT,
    CORS_ORIGIN: config.CORS_ORIGIN ?? DEFAULT_CORS_ORIGIN,
    AUTH_ENABLED: config.AUTH_ENABLED ?? "true",
  };
};
