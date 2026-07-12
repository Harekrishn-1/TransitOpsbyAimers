const express = require("express");

const router = express.Router();

const {
    getReports,
} = require("../controllers/reportController");

const isAuth = require("../middlewares/isAuth");
const authorize = require("../middlewares/authorize");

router.get(
    "/",
    isAuth,
    authorize("COMPANY_ADMIN","FLEET_MANAGER"),
    getReports
);

module.exports = router;