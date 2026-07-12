const Trip = require("../models/Trip");
const FuelLog = require("../models/FuelLog");
const Maintenance = require("../models/Maintenance");
const Vehicle = require("../models/Vehicle");

const getReports = async (req, res) => {
  try {
    const company = req.user.company;

    const [
      fuelLogs,
      completedTrips,
      vehicles,
      maintenanceLogs,
    ] = await Promise.all([
      FuelLog.find({ company }),
      Trip.find({
        company,
        status: "Completed",
      }),
      Vehicle.find({ company }),
      Maintenance.find({
        company,
        status: "COMPLETED",
      }),
    ]);

    const totalFuel = fuelLogs.reduce(
      (sum, log) => sum + log.liters,
      0
    );

    const totalFuelCost = fuelLogs.reduce(
      (sum, log) => sum + log.totalCost,
      0
    );

    const totalDistance = completedTrips.reduce(
      (sum, trip) => sum + (trip.actualDistance || 0),
      0
    );

    const totalRevenue = completedTrips.reduce(
      (sum, trip) => sum + (trip.revenue || 0),
      0
    );

    const maintenanceCost = maintenanceLogs.reduce(
      (sum, log) => sum + (log.actualCost || 0),
      0
    );

    const acquisitionCost = vehicles.reduce(
      (sum, vehicle) => sum + (vehicle.acquisitionCost || 0),
      0
    );

    const fuelEfficiency =
      totalFuel === 0 ? 0 : totalDistance / totalFuel;

    const operationalCost =
      totalFuelCost + maintenanceCost;

    const roi =
      acquisitionCost === 0
        ? 0
        : (
            (totalRevenue - operationalCost) /
            acquisitionCost
          ).toFixed(2);

    return res.json({
      success: true,

      reports: {
        totalDistance,

        totalFuel,

        fuelEfficiency,

        fuelCost: totalFuelCost,

        maintenanceCost,

        operationalCost,

        totalRevenue,

        acquisitionCost,

        roi,
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
    getReports,
};