/**
 * errors.js
 * Custom error classes and error handling utilities
 */

// ============================================================
// Custom Error Classes
// ============================================================

export class AppError extends Error {
    constructor(message, code = 'UNKNOWN_ERROR', details = null) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();
        Error.captureStackTrace(this, this.constructor);
    }
}

export class NetworkError extends AppError {
    constructor(message, details = null) {
        super(message, 'NETWORK_ERROR', details);
    }
}

export class ValidationError extends AppError {
    constructor(message, details = null) {
        super(message, 'VALIDATION_ERROR', details);
    }
}

export class NotFoundError extends AppError {
    constructor(message, details = null) {
        super(message, 'NOT_FOUND_ERROR', details);
    }
}

export class APIError extends AppError {
    constructor(message, statusCode = null, details = null) {
        super(message, 'API_ERROR', details);
        this.statusCode = statusCode;
    }
}

export class LocationError extends AppError {
    constructor(message, code = 'LOCATION_ERROR', details = null) {
        super(message, code, details);
    }
}

// ============================================================
// Error Handling Utilities
// ============================================================

/**
 * Centralized error handler
 */
export function handleError(error) {
    console.error('❌ Error caught:', error);
    console.error({
        name: error.name,
        message: error.message,
        code: error.code || 'UNKNOWN',
        timestamp: error.timestamp || new Date().toISOString(),
        stack: error.stack,
        details: error.details,
        statusCode: error.statusCode
    });

    // Determine user-friendly message based on error type
    let userMessage = 'Something went wrong. Please try again.';
    let details = null;
    let type = 'error';

    if (error instanceof NetworkError) {
        userMessage = '🌐 Network error. Please check your internet connection.';
        details = error.message;
    } else if (error instanceof NotFoundError) {
        userMessage = '🔍 City not found. Please check the spelling.';
        details = error.message;
    } else if (error instanceof ValidationError) {
        userMessage = '⚠️ Invalid input. ' + error.message;
        type = 'warning';
    } else if (error instanceof APIError) {
        userMessage = `🌐 API error${error.statusCode ? ` (${error.statusCode})` : ''}. Please try again later.`;
        details = error.message;
    } else if (error instanceof LocationError) {
        userMessage = '📍 ' + error.message;
        type = 'info';
    } else if (error instanceof AppError) {
        userMessage = error.message;
    } else if (error instanceof TypeError) {
        userMessage = '⚠️ A data type error occurred. Please try again.';
    } else if (error instanceof SyntaxError) {
        userMessage = '⚠️ Invalid data received from the server.';
    } else {
        userMessage = '⚠️ An unexpected error occurred. Please try again.';
    }

    return { message: userMessage, details, type };
}