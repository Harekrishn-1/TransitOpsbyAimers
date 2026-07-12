const express = require("express");
const controller = require("../controllers/expenseController");
const isAuth = require("../middlewares/isAuth");
const authorize = require("../middlewares/authorize");

const router = express.Router();
router.use(isAuth, authorize("COMPANY_ADMIN", "FLEET_MANAGER", "EXPENSE_MANAGER"));

router.route("/").post(controller.createExpense).get(controller.getAllExpenses);
router.route("/:id").get(controller.getExpenseById).put(controller.updateExpense).delete(controller.deleteExpense);

module.exports = router;
