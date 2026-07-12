const Expense = require("../models/Expense");

const createExpense = async (req, res) => {
  try {
    const {
      vehicle,
      trip,
      category,
      amount,
      expenseDate,
      description,
      receiptUrls,
    } = req.body;

    const expense = await Expense.create({
      company: req.user.company,
      vehicle,
      trip,
      category,
      amount,
      expenseDate,
      description,
      receiptUrls,
      submittedBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Expense added successfully",
      expense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      company: req.user.company,
    })
      .populate("vehicle", "registrationNumber vehicleName")
      .populate("trip", "source destination")
      .populate("submittedBy", "name")
      .sort({ expenseDate: -1 });

    return res.json({
      success: true,
      expenses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      company: req.user.company,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    return res.json({
      success: true,
      expense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      {
        _id: req.params.id,
        company: req.user.company,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    return res.json({
      success: true,
      message: "Expense updated successfully",
      expense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      company: req.user.company,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    return res.json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
