const express = require("express");

const router = express.Router();

const {
    getDashboard,
} = require("../controllers/dashboardController");

const isAuth = require("../middlewares/isAuth");
const authorize = require("../middlewares/authorize");

router.get(
    "/",
    isAuth,
    authorize("COMPANY_ADMIN","FLEET_MANAGER"),
    getDashboard
);

module.exports = router;