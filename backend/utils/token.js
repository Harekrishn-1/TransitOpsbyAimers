const jwt = require("jsonwebtoken");

function getJwtConfig() {
  const secret = process.env.JWT_KEY;
  if (!secret || secret.length < 32) throw new Error("JWT_KEY must be configured with at least 32 characters.");

  return {
    secret,
    signOptions: {
      algorithm: "HS256",
      audience: process.env.JWT_AUDIENCE || "transitops-api",
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      issuer: process.env.JWT_ISSUER || "transitops-api",
    },
    verifyOptions: {
      algorithms: ["HS256"],
      audience: process.env.JWT_AUDIENCE || "transitops-api",
      issuer: process.env.JWT_ISSUER || "transitops-api",
    },
  };
}

function signUserToken(user) {
  const { secret, signOptions } = getJwtConfig();
  return jwt.sign({ sub: user._id.toString(), company: user.company.toString(), roles: user.roles }, secret, signOptions);
}

function verifyUserToken(token) {
  const { secret, verifyOptions } = getJwtConfig();
  return jwt.verify(token, secret, verifyOptions);
}

module.exports = { getJwtConfig, signUserToken, verifyUserToken };
