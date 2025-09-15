"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFound = exports.errorHandler = exports.CustomError = void 0;
const library_1 = require("@prisma/client/runtime/library");
// Custom error class
class CustomError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.CustomError = CustomError;
// Handle Prisma errors
const handlePrismaError = (error) => {
    switch (error.code) {
        case "P2002":
            // Unique constraint violation
            const field = error.meta?.target;
            return new CustomError(`${field} already exists`, 409);
        case "P2025":
            // Record not found
            return new CustomError("Record not found", 404);
        case "P2003":
            // Foreign key constraint violation
            return new CustomError("Invalid reference - related record not found", 400);
        default:
            return new CustomError("Database error", 500);
    }
};
// Handle JWT errors
const handleJWTError = () => {
    return new CustomError("Invalid token", 401);
};
const handleJWTExpiredError = () => {
    return new CustomError("Token expired", 401);
};
// Handle validation errors
const handleValidationError = (error) => {
    const errors = Object.values(error.errors || {}).map((err) => err.message);
    return new CustomError(`Validation error: ${errors.join(", ")}`, 400);
};
// Global error handler
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    // Log error
    console.error("Error:", {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query,
    });
    // Handle specific error types
    if (err instanceof library_1.PrismaClientKnownRequestError) {
        error = handlePrismaError(err);
    }
    else if (err.name === "JsonWebTokenError") {
        error = handleJWTError();
    }
    else if (err.name === "TokenExpiredError") {
        error = handleJWTExpiredError();
    }
    else if (err.name === "ValidationError") {
        error = handleValidationError(err);
    }
    // Default error properties
    const statusCode = error.statusCode || 500;
    const message = error.message || "Something went wrong";
    const isOperational = error.isOperational !== false;
    // Send error response
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && {
            stack: err.stack,
            error: err.name,
        }),
    });
};
exports.errorHandler = errorHandler;
// 404 Not Found handler
const notFound = (req, res, next) => {
    const error = new CustomError(`Not found - ${req.originalUrl}`, 404);
    next(error);
};
exports.notFound = notFound;
// Async error wrapper
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map