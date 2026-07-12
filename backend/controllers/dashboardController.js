const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");
const Trip = require("../models/Trip");
const FuelLog = require("../models/FuelLog");
const Maintenance = require("../models/Maintenance");
const Expense = require("../models/Expense");

const getDashboard = async (req, res) => {
  try {
    const company = req.user.company;

    const [
      totalVehicles,
      availableVehicles,
      activeVehicles,
      maintenanceVehicles,
      retiredVehicles,

      totalDrivers,
      availableDrivers,
      activeDrivers,

      totalTrips,
      activeTrips,
      completedTrips,
      pendingTrips,

      fuelResult,
      maintenanceResult,
      expenseResult,
    ] = await Promise.all([
      Vehicle.countDocuments({ company }),

      Vehicle.countDocuments({
        company,
        status: "Available",
      }),

      Vehicle.countDocuments({
        company,
        status: "On Trip",
      }),

      Vehicle.countDocuments({
        company,
        status: "In Shop",
      }),

      Vehicle.countDocuments({
        company,
        status: "Retired",
      }),

      Driver.countDocuments({ company }),

      Driver.countDocuments({
        company,
        status: "Available",
      }),

      Driver.countDocuments({
        company,
        status: "On Trip",
      }),

      Trip.countDocuments({ company }),

      Trip.countDocuments({
        company,
        status: "Dispatched",
      }),

      Trip.countDocuments({
        company,
        status: "Completed",
      }),

      Trip.countDocuments({
        company,
        status: "Draft",
      }),

      FuelLog.aggregate([
        {
          $match: {
            company,
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$totalCost",
            },
          },
        },
      ]),

      Maintenance.aggregate([
        {
          $match: {
            company,
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$actualCost",
            },
          },
        },
      ]),

      Expense.aggregate([
        {
          $match: {
            company,
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amount",
            },
          },
        },
      ]),
    ]);

    const fuelCost = fuelResult[0]?.total || 0;
    const maintenanceCost = maintenanceResult[0]?.total || 0;
    const expenseCost = expenseResult[0]?.total || 0;

    const fleetUtilization =
      totalVehicles === 0
        ? 0
        : Number(((activeVehicles / totalVehicles) * 100).toFixed(2));

    return res.json({
      success: true,

      dashboard: {
        vehicles: {
          total: totalVehicles,
          available: availableVehicles,
          active: activeVehicles,
          maintenance: maintenanceVehicles,
          retired: retiredVehicles,
        },

        drivers: {
          total: totalDrivers,
          available: availableDrivers,
          active: activeDrivers,
        },

        trips: {
          total: totalTrips,
          active: activeTrips,
          completed: completedTrips,
          pending: pendingTrips,
        },

        costs: {
          fuel: fuelCost,
          maintenance: maintenanceCost,
          expenses: expenseCost,
          total:
            fuelCost +
            maintenanceCost +
            expenseCost,
        },

        fleetUtilization,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
    getDashboard,
};