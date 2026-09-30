const assert = require("node:assert/strict");
const test = require("node:test");
const argon2 = require("argon2");
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
