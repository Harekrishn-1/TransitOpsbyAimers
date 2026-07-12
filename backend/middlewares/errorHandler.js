module.exports = function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Something went wrong on the server.";

  if (!err.isOperational) {
    console.error(err); // log unexpected errors for debugging
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};