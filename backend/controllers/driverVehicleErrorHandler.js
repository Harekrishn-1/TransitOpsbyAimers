function handleDriverVehicleError(error, res) {
  if (error && error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || "field";
    return res.status(409).json({ success: false, message: `${field} already exists in this company.`, data: null });
  }
  if (error && (error.name === "ValidationError" || error.name === "CastError" || error.statusCode === 400)) {
    return res.status(400).json({ success: false, message: error.message, data: null });
  }
  if (error && error.statusCode) {
    return res.status(error.statusCode).json({ success: false, message: error.message, data: null });
  }
  return res.status(500).json({ success: false, message: "An unexpected error occurred.", data: null });
}

module.exports = { handleDriverVehicleError };
