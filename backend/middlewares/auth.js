const { authenticate, authorizeRoles } = require("./authMiddleware");

// Trip module compatibility exports; implementation remains the shared auth middleware.
module.exports = { protect: authenticate, authorize: authorizeRoles };
