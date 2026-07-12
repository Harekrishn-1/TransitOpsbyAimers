const assert = require("node:assert/strict");
const test = require("node:test");
const { signUserToken, verifyUserToken } = require("../utils/token");

const originalEnvironment = {
  JWT_KEY: process.env.JWT_KEY,
  JWT_AUDIENCE: process.env.JWT_AUDIENCE,
  JWT_ISSUER: process.env.JWT_ISSUER,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
};

test.before(() => {
  process.env.JWT_KEY = "test-jwt-key-that-is-at-least-thirty-two-characters";
  process.env.JWT_AUDIENCE = "transitops-test";
  process.env.JWT_ISSUER = "transitops-test";
  process.env.JWT_EXPIRES_IN = "1h";
});

test.after(() => {
  for (const [key, value] of Object.entries(originalEnvironment)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test("JWT includes and verifies the expected user claims", () => {
  const token = signUserToken({
    _id: { toString: () => "507f1f77bcf86cd799439011" },
    company: { toString: () => "507f1f77bcf86cd799439012" },
    roles: ["COMPANY_ADMIN"],
  });

  const payload = verifyUserToken(token);
  assert.equal(payload.sub, "507f1f77bcf86cd799439011");
  assert.equal(payload.company, "507f1f77bcf86cd799439012");
  assert.deepEqual(payload.roles, ["COMPANY_ADMIN"]);
});

test("JWT verification rejects a token signed with a different key", () => {
  const token = signUserToken({
    _id: { toString: () => "507f1f77bcf86cd799439011" },
    company: { toString: () => "507f1f77bcf86cd799439012" },
    roles: ["DRIVER"],
  });
  process.env.JWT_KEY = "a-different-test-jwt-key-at-least-32-characters";

  assert.throws(() => verifyUserToken(token));
  process.env.JWT_KEY = "test-jwt-key-that-is-at-least-thirty-two-characters";
});
