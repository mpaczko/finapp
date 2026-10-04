const assert = require("node:assert/strict");
const test = require("node:test");
const argon2 = require("argon2");
const { createHash } = require("node:crypto");
const { JwtService } = require("@nestjs/jwt");

const { AuthService } = require("../dist/modules/auth/auth.service");
const { AuthController } = require("../dist/modules/auth/auth.controller");
const { JwtAuthGuard } = require("../dist/common/guards/jwt-auth.guard");

const testConfig = {
  getOrThrow: (key) => {
    const values = {
      JWT_SECRET: "test-only-secret",
      JWT_EXPIRES_IN: "1h",
    };
    return values[key];
  },
  get: (key) => (key === "COOKIE_SECURE" ? "false" : undefined),
};

test("AuthService registers a user with an Argon2 hash and omits it from the response", async () => {
  let createdUser;
  const prisma = {
    user: {
      create: async ({ data }) => {
        createdUser = { id: "user-1", ...data };
        return createdUser;
      },
    },
  };
  const service = new AuthService(prisma, new JwtService(), testConfig);

  const result = await service.register({
    email: "  TEST@EXAMPLE.COM ",
    password: "password-123",
  });

  assert.deepEqual(result, { id: "user-1", email: "test@example.com" });
  assert.equal(await argon2.verify(createdUser.passwordHash, "password-123"), true);
  assert.equal("passwordHash" in result, false);
});

test("AuthService accepts correct credentials and rejects invalid credentials", async () => {
  const passwordHash = await argon2.hash("password-123");
  const prisma = {
    user: {
      findUnique: async () => ({
        id: "user-1",
        email: "test@example.com",
        passwordHash,
        mustResetPassword: false,
      }),
    },
  };
  const service = new AuthService(prisma, new JwtService(), testConfig);

  assert.deepEqual(
    await service.validateCredentials({ email: "test@example.com", password: "password-123" }),
    { id: "user-1", email: "test@example.com" },
  );
  await assert.rejects(
    service.validateCredentials({ email: "test@example.com", password: "bad-password" }),
  );
});

test("AuthService resets the password once and invalidates the user's other reset tokens", async () => {
  const updates = [];
  let updatedUser;
  const prisma = {
    $transaction: async (callback) => callback(prisma),
    passwordResetToken: {
      updateMany: async (args) => {
        updates.push(args);
        return { count: updates.length === 1 ? 1 : 2 };
      },
      findUnique: async () => ({ userId: "user-1" }),
    },
    user: {
      update: async ({ data }) => {
        updatedUser = data;
      },
    },
  };
  const service = new AuthService(prisma, new JwtService(), testConfig);

  await service.resetPassword({
    token: "reset-token",
    password: "new-password",
    confirmPassword: "new-password",
  });

  assert.equal(
    updates[0].where.tokenHash,
    createHash("sha256").update("reset-token").digest("hex"),
  );
  assert.equal(updates[0].where.usedAt, null);
  assert.ok(updates[0].where.expiresAt.gt instanceof Date);
  assert.equal(await argon2.verify(updatedUser.passwordHash, "new-password"), true);
  assert.equal(updatedUser.mustResetPassword, false);
  assert.deepEqual(updates[1].where, { userId: "user-1", usedAt: null });
});

test("AuthService rejects invalid or already-used password reset tokens", async () => {
  let userUpdated = false;
  const prisma = {
    $transaction: async (callback) => callback(prisma),
    passwordResetToken: {
      updateMany: async () => ({ count: 0 }),
    },
    user: {
      update: async () => {
        userUpdated = true;
      },
    },
  };
  const service = new AuthService(prisma, new JwtService(), testConfig);

  await assert.rejects(
    service.resetPassword({
      token: "already-used-token",
      password: "new-password",
      confirmPassword: "new-password",
    }),
    /Invalid or expired password reset token/,
  );
  assert.equal(userUpdated, false);
});

test("AuthService rejects mismatched password reset confirmation", async () => {
  const service = new AuthService({}, new JwtService(), testConfig);

  await assert.rejects(
    service.resetPassword({
      token: "reset-token",
      password: "new-password",
      confirmPassword: "different-password",
    }),
    /Passwords do not match/,
  );
});

test("AuthController sets and clears the HttpOnly session cookie", async () => {
  const user = { id: "user-1", email: "test@example.com" };
  const authService = {
    register: async () => user,
    createSession: async () => "signed-session",
    getSessionCookieOptions: () => ({ httpOnly: true, sameSite: "lax", secure: false, maxAge: 3_600_000, path: "/" }),
  };
  const cookies = [];
  const clearedCookies = [];
  const response = {
    cookie: (...args) => cookies.push(args),
    clearCookie: (...args) => clearedCookies.push(args),
  };
  const controller = new AuthController(authService);

  assert.deepEqual(
    await controller.register({ email: user.email, password: "password-123" }, response),
    { user },
  );
  controller.logout(response);

  assert.equal(cookies[0][0], "finapp_session");
  assert.equal(cookies[0][1], "signed-session");
  assert.equal(cookies[0][2].httpOnly, true);
  assert.equal(clearedCookies[0][0], "finapp_session");
});

test("JwtAuthGuard accepts a valid cookie and rejects a missing one", async () => {
  const jwtService = new JwtService();
  const token = await jwtService.signAsync(
    { sub: "user-1", email: "test@example.com" },
    { secret: "test-only-secret", expiresIn: "1h" },
  );
  const reflector = { getAllAndOverride: () => false };
  const guard = new JwtAuthGuard(testConfig, jwtService, reflector);
  const request = { cookies: { finapp_session: token } };
  const context = {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => request }),
  };

  assert.equal(await guard.canActivate(context), true);
  assert.deepEqual(request.user, { id: "user-1", email: "test@example.com" });
  await assert.rejects(
    guard.canActivate({
      ...context,
      switchToHttp: () => ({ getRequest: () => ({ cookies: {} }) }),
    }),
  );
});
