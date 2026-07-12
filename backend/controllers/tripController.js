const mongoose = require("mongoose");
const Trip = require("../models/Trip");
const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateTripNumber() {
  // e.g. TRIP-LX9F3K2A
  return `TRIP-${Date.now().toString(36).toUpperCase()}`;
}

async function getCompanyVehicleOrFail(vehicleId, companyId, session) {
  const vehicle = await Vehicle.findOne({ _id: vehicleId, company: companyId }).session(session || null);
  if (!vehicle) throw new ApiError(404, "Vehicle not found in this company.");
  return vehicle;
}

async function getCompanyDriverOrFail(driverId, companyId, session) {
  const driver = await Driver.findOne({ _id: driverId, company: companyId }).session(session || null);
  if (!driver) throw new ApiError(404, "Driver not found in this company.");
  return driver;
}

function validateCapacity(cargoWeightKg, vehicle) {
  if (cargoWeightKg > vehicle.maximumLoadCapacityKg) {
    throw new ApiError(
      400,
      `Cargo weight (${cargoWeightKg}kg) exceeds vehicle capacity (${vehicle.maximumLoadCapacityKg}kg).`
    );
  }
}

// ---------------------------------------------------------------------------
// POST /trips  — create a trip (status: DRAFT)
// ---------------------------------------------------------------------------
exports.createTrip = catchAsync(async (req, res) => {
  const company = req.user.company;
  const {
    tripNumber,
    vehicle: vehicleId,
    driver: driverId,
    source,
    destination,
    cargoWeightKg,
    plannedDistanceKm,
    plannedStartAt,
    revenue,
    notes,
  } = req.body;

  if (!vehicleId || !driverId || !source || !destination || cargoWeightKg == null || plannedDistanceKm == null) {
    throw new ApiError(400, "vehicle, driver, source, destination, cargoWeightKg, plannedDistanceKm are required.");
  }

  const vehicle = await getCompanyVehicleOrFail(vehicleId, company);
  const driver = await getCompanyDriverOrFail(driverId, company);

  // Business rules: vehicle & driver must currently be available, cargo must fit capacity
  if (vehicle.status !== "AVAILABLE") {
    throw new ApiError(409, `Vehicle is not available (current status: ${vehicle.status}).`);
  }
  if (driver.status !== "AVAILABLE") {
    throw new ApiError(409, `Driver is not available (current status: ${driver.status}).`);
  }
  validateCapacity(cargoWeightKg, vehicle);

  const trip = await Trip.create({
    company,
    tripNumber: tripNumber ? tripNumber.toUpperCase() : generateTripNumber(),
    vehicle: vehicle._id,
    driver: driver._id,
    source,
    destination,
    cargoWeightKg,
    plannedDistanceKm,
    plannedStartAt,
    revenue,
    notes,
    status: "DRAFT",
    createdBy: req.user.id,
  });

  res.status(201).json({ success: true, data: trip });
});

// ---------------------------------------------------------------------------
// GET /trips  — list trips (scoped to company, filterable, paginated)
// ---------------------------------------------------------------------------
exports.getTrips = catchAsync(async (req, res) => {
  const company = req.user.company;
  const { status, vehicle, driver, page = 1, limit = 20 } = req.query;

  const filter = { company };
  if (status) filter.status = status;
  if (vehicle) filter.vehicle = vehicle;
  if (driver) filter.driver = driver;

  const skip = (Number(page) - 1) * Number(limit);

  const [trips, total] = await Promise.all([
    Trip.find(filter)
      .populate("vehicle", "name registrationNumber status")
      .populate("driver", "licenseNumber status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Trip.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: trips,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  });
});

// ---------------------------------------------------------------------------
// GET /trips/:id
// ---------------------------------------------------------------------------
exports.getTripById = catchAsync(async (req, res) => {
  const trip = await Trip.findOne({ _id: req.params.id, company: req.user.company })
    .populate("vehicle")
    .populate("driver")
    .populate("createdBy", "name email")
    .populate("dispatchedBy", "name email")
    .populate("completedBy", "name email");

  if (!trip) throw new ApiError(404, "Trip not found.");

  res.status(200).json({ success: true, data: trip });
});

// ---------------------------------------------------------------------------
// PUT /trips/:id  — edit trip (only while still DRAFT)
// ---------------------------------------------------------------------------
exports.updateTrip = catchAsync(async (req, res) => {
  const trip = await Trip.findOne({ _id: req.params.id, company: req.user.company });
  if (!trip) throw new ApiError(404, "Trip not found.");

  if (trip.status !== "DRAFT") {
    throw new ApiError(400, `Trip cannot be edited once it is ${trip.status}.`);
  }

  const editable = [
    "source",
    "destination",
    "cargoWeightKg",
    "plannedDistanceKm",
    "plannedStartAt",
    "revenue",
    "notes",
    "vehicle",
    "driver",
  ];

  for (const field of editable) {
    if (req.body[field] !== undefined) trip[field] = req.body[field];
  }

  // Re-validate if vehicle or cargo weight changed
  const vehicle = await getCompanyVehicleOrFail(trip.vehicle, req.user.company);
  if (vehicle.status !== "AVAILABLE") {
    throw new ApiError(409, `Vehicle is not available (current status: ${vehicle.status}).`);
  }
  validateCapacity(trip.cargoWeightKg, vehicle);

  const driver = await getCompanyDriverOrFail(trip.driver, req.user.company);
  if (driver.status !== "AVAILABLE") {
    throw new ApiError(409, `Driver is not available (current status: ${driver.status}).`);
  }

  await trip.save();

  res.status(200).json({ success: true, data: trip });
});

// ---------------------------------------------------------------------------
// POST /trips/:id/dispatch  — DRAFT -> DISPATCHED
// vehicle.status -> ON_TRIP, driver.status -> ON_TRIP
// ---------------------------------------------------------------------------
exports.dispatchTrip = catchAsync(async (req, res) => {
  const { dispatchOdometerKm } = req.body;
  if (dispatchOdometerKm == null) {
    throw new ApiError(400, "dispatchOdometerKm is required to dispatch a trip.");
  }

  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const trip = await Trip.findOne({ _id: req.params.id, company: req.user.company }).session(session);
      if (!trip) throw new ApiError(404, "Trip not found.");
      if (trip.status !== "DRAFT") {
        throw new ApiError(400, `Only DRAFT trips can be dispatched (current status: ${trip.status}).`);
      }

      const vehicle = await Vehicle.findOne({ _id: trip.vehicle, company: req.user.company }).session(session);
      const driver = await Driver.findOne({ _id: trip.driver, company: req.user.company }).session(session);

      if (vehicle.status !== "AVAILABLE") {
        throw new ApiError(409, `Vehicle is not available (current status: ${vehicle.status}).`);
      }
      if (driver.status !== "AVAILABLE") {
        throw new ApiError(409, `Driver is not available (current status: ${driver.status}).`);
      }

      trip.status = "DISPATCHED";
      trip.dispatchedAt = new Date();
      trip.dispatchOdometerKm = dispatchOdometerKm;
      trip.dispatchedBy = req.user.id;

      vehicle.status = "ON_TRIP";
      driver.status = "ON_TRIP";

      await trip.save({ session });
      await vehicle.save({ session });
      await driver.save({ session });

      result = trip;
    });

    res.status(200).json({ success: true, message: "Trip dispatched.", data: result });
  } finally {
    session.endSession();
  }
});

// ---------------------------------------------------------------------------
// POST /trips/:id/complete  — DISPATCHED -> COMPLETED
// vehicle.status -> AVAILABLE, driver.status -> AVAILABLE
// ---------------------------------------------------------------------------
exports.completeTrip = catchAsync(async (req, res) => {
  const { completionOdometerKm, actualDistanceKm } = req.body;
  if (completionOdometerKm == null) {
    throw new ApiError(400, "completionOdometerKm is required to complete a trip.");
  }

  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const trip = await Trip.findOne({ _id: req.params.id, company: req.user.company }).session(session);
      if (!trip) throw new ApiError(404, "Trip not found.");
      if (trip.status !== "DISPATCHED") {
        throw new ApiError(400, `Only DISPATCHED trips can be completed (current status: ${trip.status}).`);
      }
      if (completionOdometerKm < trip.dispatchOdometerKm) {
        throw new ApiError(400, "Completion odometer cannot be less than dispatch odometer.");
      }

      const vehicle = await Vehicle.findOne({ _id: trip.vehicle, company: req.user.company }).session(session);
      const driver = await Driver.findOne({ _id: trip.driver, company: req.user.company }).session(session);

      trip.completionOdometerKm = completionOdometerKm;
      trip.actualDistanceKm = actualDistanceKm != null ? actualDistanceKm : completionOdometerKm - trip.dispatchOdometerKm;
      trip.completedAt = new Date();
      trip.status = "COMPLETED";
      trip.completedBy = req.user.id;

      vehicle.status = "AVAILABLE";
      vehicle.odometerKm = completionOdometerKm;

      driver.status = "AVAILABLE";

      await trip.save({ session });
      await vehicle.save({ session });
      await driver.save({ session });

      result = trip;
    });

    res.status(200).json({ success: true, message: "Trip completed.", data: result });
  } finally {
    session.endSession();
  }
});

// ---------------------------------------------------------------------------
// POST /trips/:id/cancel  — DRAFT or DISPATCHED -> CANCELLED
// If it was DISPATCHED, free up vehicle & driver back to AVAILABLE
// ---------------------------------------------------------------------------
exports.cancelTrip = catchAsync(async (req, res) => {
  const { reason } = req.body;

  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const trip = await Trip.findOne({ _id: req.params.id, company: req.user.company }).session(session);
      if (!trip) throw new ApiError(404, "Trip not found.");

      if (!["DRAFT", "DISPATCHED"].includes(trip.status)) {
        throw new ApiError(400, `Trip in status ${trip.status} cannot be cancelled.`);
      }

      const wasDispatched = trip.status === "DISPATCHED";

      trip.status = "CANCELLED";
      if (reason) trip.notes = trip.notes ? `${trip.notes}\nCancellation reason: ${reason}` : `Cancellation reason: ${reason}`;

      if (wasDispatched) {
        const vehicle = await Vehicle.findOne({ _id: trip.vehicle, company: req.user.company }).session(session);
        const driver = await Driver.findOne({ _id: trip.driver, company: req.user.company }).session(session);
        vehicle.status = "AVAILABLE";
        driver.status = "AVAILABLE";
        await vehicle.save({ session });
        await driver.save({ session });
      }

      await trip.save({ session });
      result = trip;
    });

    res.status(200).json({ success: true, message: "Trip cancelled.", data: result });
  } finally {
    session.endSession();
  }
});