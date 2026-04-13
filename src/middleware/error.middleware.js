const env = require("../config/env");

function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  const message = err.message || "Internal server error";
  if (env.nodeEnv !== "production" && status === 500) {
    console.error(err);
  }
  res.status(status).json({
    message,
    ...(env.nodeEnv !== "production" && err.stack ? { stack: err.stack } : {}),
  });
}

function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

module.exports = { errorHandler, notFound };
