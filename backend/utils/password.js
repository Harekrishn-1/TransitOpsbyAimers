const bcrypt = require("bcrypt");

const BCRYPT_ROUNDS = 12;

async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = { BCRYPT_ROUNDS, hashPassword, comparePassword };
