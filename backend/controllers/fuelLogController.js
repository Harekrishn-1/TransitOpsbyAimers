const FuelLog = require("../models/FuelLog");
const Vehicle = require("../models/Vehicle");
const Trip = require("../models/Trip");


const createFuelLog = async (req, res) => {
  try {
    const {
      vehicle,
      trip,
      liters,
      totalCost,
      odometerKm,
      fuelStation,
      receiptUrl,
      filledAt,
    } = req.body;

    const fuelLog = await FuelLog.create({
      company: req.user.company,
      vehicle,
      trip,
      liters,
      totalCost,
      odometerKm,
      fuelStation,
      receiptUrl,
      filledAt,
      recordedBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Fuel log added successfully",
      fuelLog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getAllFuelLogs = async (req, res) => {
  try {
    const fuelLogs = await FuelLog.find({
      company: req.user.company,
    })
      .populate("vehicle", "registrationNumber vehicleName")
      .populate("trip", "source destination")
      .populate("recordedBy", "name")
      .sort({ filledAt: -1 });

    return res.json({
      success: true,
      fuelLogs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getFuelLogById = async (req, res) => {
  try {
    const fuelLog = await FuelLog.findOne({
      _id: req.params.id,
      company: req.user.company,
    })
      .populate("vehicle")
      .populate("trip")
      .populate("recordedBy", "name");

    if (!fuelLog) {
      return res.status(404).json({
        success: false,
        message: "Fuel log not found",
      });
    }

    return res.json({
      success: true,
      fuelLog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateFuelLog = async (req, res) => {
  try {
    const fuelLog = await FuelLog.findOneAndUpdate(
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

    if (!fuelLog) {
      return res.status(404).json({
        success: false,
        message: "Fuel log not found",
      });
    }

    return res.json({
      success: true,
      message: "Fuel log updated successfully",
      fuelLog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteFuelLog = async (req, res) => {
  try {
    const fuelLog = await FuelLog.findOneAndDelete({
      _id: req.params.id,
      company: req.user.company,
    });

    if (!fuelLog) {
      return res.status(404).json({
        success: false,
        message: "Fuel log not found",
      });
    }

    return res.json({
      success: true,
      message: "Fuel log deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createFuelLog,
  getAllFuelLogs,
  getFuelLogById,
  updateFuelLog,
  deleteFuelLog,
};