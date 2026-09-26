// errors/index.js

// ============================================================
// BASE ERROR CLASS
// ============================================================

export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true; // Marks as expected/handled error
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

// ============================================================
// 4xx — CLIENT ERRORS
// ============================================================

// 400 Bad Request
export class BadRequestError extends AppError {
  constructor(message = 'Bad Request', details = null) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

// 401 Unauthorized
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', details = null) {
    super(message, 401, 'UNAUTHORIZED', details);
  }
}

// 403 Forbidden
export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden', details = null) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

// 404 Not Found
export class NotFoundError extends AppError {
  constructor(resource = 'Resource', details = null) {
    super(`${resource} not found`, 404, 'NOT_FOUND', details);
  }
}

// 405 Method Not Allowed
export class MethodNotAllowedError extends AppError {
  constructor(method = '', allowed = [], details = null) {
    super(
      `Method ${method} not allowed`,
      405,
      'METHOD_NOT_ALLOWED',
      { ...details, allowedMethods: allowed }
    );
  }
}

// 409 Conflict
export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', details = null) {
    super(message, 409, 'CONFLICT', details);
  }
}

// 413 Payload Too Large
export class PayloadTooLargeError extends AppError {
  constructor(message = 'Payload too large', details = null) {
    super(message, 413, 'PAYLOAD_TOO_LARGE', details);
  }
}

// 415 Unsupported Media Type
export class UnsupportedMediaTypeError extends AppError {
  constructor(message = 'Unsupported media type', details = null) {
    super(message, 415, 'UNSUPPORTED_MEDIA_TYPE', details);
  }
}

// 422 Unprocessable Entity (validation failed)
export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null) {
    super(message, 422, 'VALIDATION_ERROR', details);
  }
}

// 429 Too Many Requests
export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests', details = null) {
    super(message, 429, 'TOO_MANY_REQUESTS', details);
  }
}

// ============================================================
// 5xx — SERVER ERRORS
// ============================================================

// 500 Internal Server Error (programmer bug)
export class InternalError extends AppError {
  constructor(message = 'Internal server error', details = null) {
    super(message, 500, 'INTERNAL_ERROR', details);
    this.isOperational = false; // Marks as unexpected error
  }
}

// 503 Service Unavailable
export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable', details = null) {
    super(message, 503, 'SERVICE_UNAVAILABLE', details);
  }
}