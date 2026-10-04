const assert = require("node:assert/strict");
const test = require("node:test");

const { MailService } = require("../dist/modules/mail/mail.service");

test("MailService sends a password reset email", async () => {
  const sentMessages = [];
  const config = {
    get: (key) => ({
      SMTP_FROM: "Finapp <no-reply@example.com>",
    })[key],
  };
  const service = new MailService(config);
  service.transporter = {
    sendMail: async (message) => {
      sentMessages.push(message);
    },
  };

  await service.sendPasswordResetEmail(
    "user@example.com",
    "https://app.example.com/reset-password?token=secret-token",
  );

  assert.equal(sentMessages.length, 1);
  assert.equal(sentMessages[0].to, "user@example.com");
  assert.equal(sentMessages[0].subject, "Ustaw nowe hasło do Finapp");
  assert.match(sentMessages[0].text, /secret-token/);
  assert.match(sentMessages[0].html, /href="https:\/\/app\.example\.com/);
});
