/**
 * Wraps async route handlers so errors propagate to error middleware.
 */
function catchAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { catchAsync };
