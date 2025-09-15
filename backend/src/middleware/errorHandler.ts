import { Request, Response, NextFunction } from "express";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Custom error class
export class CustomError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle Prisma errors
const handlePrismaError = (error: PrismaClientKnownRequestError): AppError => {
  switch (error.code) {
    case "P2002":
      // Unique constraint violation
      const field = error.meta?.target as string;
      return new CustomError(`${field} already exists`, 409);
    case "P2025":
      // Record not found
      return new CustomError("Record not found", 404);
    case "P2003":
      // Foreign key constraint violation
      return new CustomError(
        "Invalid reference - related record not found",
        400
      );
    default:
      return new CustomError("Database error", 500);
  }
};

// Handle JWT errors
const handleJWTError = (): AppError => {
  return new CustomError("Invalid token", 401);
};

const handleJWTExpiredError = (): AppError => {
  return new CustomError("Token expired", 401);
};

// Handle validation errors
const handleValidationError = (error: any): AppError => {
  const errors = Object.values(error.errors || {}).map(
    (err: any) => err.message
  );
  return new CustomError(`Validation error: ${errors.join(", ")}`, 400);
};

// Global error handler
export const errorHandler = (
  err: Error | AppError | PrismaClientKnownRequestError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
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
  if (err instanceof PrismaClientKnownRequestError) {
    error = handlePrismaError(err);
  } else if (err.name === "JsonWebTokenError") {
    error = handleJWTError();
  } else if (err.name === "TokenExpiredError") {
    error = handleJWTExpiredError();
  } else if (err.name === "ValidationError") {
    error = handleValidationError(err);
  }

  // Default error properties
  const statusCode = (error as AppError).statusCode || 500;
  const message = error.message || "Something went wrong";
  const isOperational = (error as AppError).isOperational !== false;

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

// 404 Not Found handler
export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new CustomError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
