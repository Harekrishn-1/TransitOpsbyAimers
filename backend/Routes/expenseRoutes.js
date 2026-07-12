const express = require("express");
const controller = require("../controllers/expenseController");
const isAuth = require("../middlewares/isAuth");
const authorize = require("../middlewares/authorize");
const { EXPENSE_MANAGEMENT_ROLES } = require("../models/constants");

const router = express.Router();
router.use(isAuth, authorize(...EXPENSE_MANAGEMENT_ROLES));

router.route("/").post(controller.createExpense).get(controller.getAllExpenses);
router.route("/:id").get(controller.getExpenseById).put(controller.updateExpense).delete(controller.deleteExpense);

module.exports = router;
