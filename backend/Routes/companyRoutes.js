const express = require("express");
const controller = require("../controllers/companyController");
const { authenticate, authorizeRoles } = require("../middlewares/authMiddleware");
const { FLEET_MANAGEMENT_ROLES } = require("../models/constants");

const router = express.Router();
router.use(authenticate, authorizeRoles(...FLEET_MANAGEMENT_ROLES));

router.get("/", controller.getCompany);
router.put("/", authorizeRoles("COMPANY_ADMIN"), controller.updateCompany);

module.exports = router;
