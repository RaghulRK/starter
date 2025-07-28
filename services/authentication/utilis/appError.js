class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = 'error';
    this.operational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;