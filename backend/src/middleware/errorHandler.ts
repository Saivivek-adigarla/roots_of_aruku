import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isDev = process.env.NODE_ENV === 'development';

  let error = err;

  if (!(err instanceof AppError)) {
    const statusCode = 500;
    const message = isDev ? err.message : 'Internal Server Error';
    error = new AppError(statusCode, message, false);
  }

  const { statusCode, message } = error as AppError;

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(isDev && { stack: err.stack }),
  });
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
