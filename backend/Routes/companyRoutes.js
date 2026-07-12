const express = require("express");
const controller = require("../controllers/companyController");
const { authenticate, authorizeRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authenticate, controller.getCompany);
router.put("/", authenticate, authorizeRoles("COMPANY_ADMIN"), controller.updateCompany);

module.exports = router;
