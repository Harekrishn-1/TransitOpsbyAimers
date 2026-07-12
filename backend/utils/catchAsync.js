// Wraps an async route handler so any thrown error / rejected promise
// automatically goes to Express's error handler via next(err).
module.exports = function catchAsync(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};