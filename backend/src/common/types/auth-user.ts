export type AuthUser = {
  id: string;
  email?: string;
  role?: string;
};

export type SupabaseJwtPayload = {
  sub?: string;
  email?: string;
  role?: string;
  iss?: string;
};
