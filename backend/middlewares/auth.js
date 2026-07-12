const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");

/**
 * NOTE: If Person 1 (Auth) has already built this middleware, use theirs instead —
 * just make sure req.user ends up with: { id, company, roles }.
 * This version is included so Trip Management can be tested independently.
 */

const protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new ApiError(401, "You are not logged in. Please log in to continue.");
  }

  const decoded = jwt.verify(token, process.env.JWT_KEY);

  const user = await User.findById(decoded.id).select("-password");
  if (!user || !user.isActive) {
    throw new ApiError(401, "User no longer exists or is inactive.");
  }

  req.user = {
    id: user._id,
    company: user.company,
    roles: user.roles,
  };

  next();
});

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Not authenticated.");
    }
    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      throw new ApiError(403, "You do not have permission to perform this action.");
    }
    next();
  };
};

module.exports = { protect, authorize };