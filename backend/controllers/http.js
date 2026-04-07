class HttpError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

function sendError(res, error) {
  res.status(error.status || 500).json({
    error: error.message || "Internal server error",
    details: error.details || null
  });
}

module.exports = {
  HttpError,
  sendError
};
