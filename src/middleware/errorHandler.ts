import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  status?: number;
  statusCode?: number;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let status = error.status || error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    status = 400;
    message = 'Validation Error';
  }

  if (error.name === 'UnauthorizedError') {
    status = 401;
    message = 'Unauthorized';
  }

  if (error.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token';
  }

  if (error.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token expired';
  }

  if (error.name === 'QueryFailedError') {
    status = 400;
    if (error.message.includes('duplicate key value')) {
      message = 'Resource already exists';
    } else if (error.message.includes('foreign key constraint')) {
      message = 'Referenced resource not found';
    } else {
      message = 'Database query failed';
    }
  }

  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      details: error.message
    })
  });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};