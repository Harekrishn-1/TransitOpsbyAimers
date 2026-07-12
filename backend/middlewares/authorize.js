const { authorizeRoles } = require("./authMiddleware");

module.exports = (...roles) => authorizeRoles(...roles);
