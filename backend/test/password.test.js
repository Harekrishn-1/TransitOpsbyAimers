const assert = require("node:assert/strict");
const test = require("node:test");
const { BCRYPT_ROUNDS, comparePassword, hashPassword } = require("../utils/password");
const User = require("../models/User");

test("passwords are bcrypt hashed and verified", async () => {
  const password = "a-long-and-unique-test-password";
  const hash = await hashPassword(password);

  assert.match(hash, /^\$2[aby]\$12\$/);
  assert.equal(BCRYPT_ROUNDS, 12);
  assert.equal(await comparePassword(password, hash), true);
  assert.equal(await comparePassword("incorrect-password", hash), false);
});

test("user passwords are required, length-limited, and excluded from normal queries", async () => {
  const user = new User({
    company: "507f1f77bcf86cd799439011",
    name: "Test User",
    email: "test@example.com",
    password: "short",
    roles: ["DRIVER"],
  });

  await assert.rejects(user.validate());
  assert.equal(User.schema.path("password").options.select, false);
});
