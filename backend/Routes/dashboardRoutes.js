const express = require("express");

const router = express.Router();

const {
    getDashboard,
} = require("../controllers/dashboardController");

const isAuth = require("../middlewares/isAuth");
const authorize = require("../middlewares/authorize");
const { FINANCIAL_VIEW_ROLES } = require("../models/constants");

router.get(
    "/",
    isAuth,
    authorize(...FINANCIAL_VIEW_ROLES),
    getDashboard
);

module.exports = router;
