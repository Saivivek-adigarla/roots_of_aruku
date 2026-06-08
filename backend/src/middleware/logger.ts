import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const originalSend = res.send;

  res.send = function (data: any) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const method = req.method;
    const path = req.path;
    const ip = req.ip;

    const logLevel = statusCode >= 400 ? 'error' : 'info';
    const timestamp = new Date().toISOString();

    console.log(
      `[${timestamp}] ${logLevel.toUpperCase()} ${method} ${path} ${statusCode} ${duration}ms ${ip}`
    );

    return originalSend.call(this, data);
  };

  next();
};
