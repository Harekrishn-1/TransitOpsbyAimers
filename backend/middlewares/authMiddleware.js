const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Company = require("../models/Company");

function authError(res, status, message) {
  return res.status(status).json({ success: false, message, data: null });
}

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) return authError(res, 401, "Authentication token is required.");
    if (!process.env.JWT_KEY) return authError(res, 500, "JWT_KEY is not configured.");

    const payload = jwt.verify(header.slice(7), process.env.JWT_KEY);
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) return authError(res, 401, "User account is inactive or no longer exists.");

    const company = await Company.findById(user.company).select("isActive");
    if (!company || !company.isActive) return authError(res, 403, "Company account is inactive or no longer exists.");

    req.user = user;
    req.company = user.company;
    next();
  } catch (error) {
    return authError(res, 401, "Invalid or expired authentication token.");
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return authError(res, 401, "Authentication is required.");
    if (!req.user.roles.some((role) => allowedRoles.includes(role))) return authError(res, 403, "You do not have permission to perform this action.");
    next();
  };
}

module.exports = { authenticate, authorizeRoles };
