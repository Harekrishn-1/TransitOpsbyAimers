const mongoose = require("mongoose");
const Vehicle = require("../models/Vehicle");
const Trip = require("../models/Trip");
const ApiError = require("./ApiError");

async function requireCompanyResource(Model, id, company, label) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, `A valid ${label.toLowerCase()} id is required.`);
  const resource = await Model.findOne({ _id: id, company });
  if (!resource) throw new ApiError(400, `${label} must belong to the authenticated company.`);
  return resource;
}

async function validateCompanyVehicleAndTrip({ company, vehicle, trip }) {
  if (vehicle !== undefined && vehicle !== null) await requireCompanyResource(Vehicle, vehicle, company, "Vehicle");
  if (trip !== undefined && trip !== null) await requireCompanyResource(Trip, trip, company, "Trip");
}

module.exports = { requireCompanyResource, validateCompanyVehicleAndTrip };
