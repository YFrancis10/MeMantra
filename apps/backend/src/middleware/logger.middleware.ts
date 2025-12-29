import { Request, Response, NextFunction } from 'express';

const sanitizeLogValue = (value: unknown): unknown => {
  if (typeof value === 'string') {
    // Remove line breaks and other ASCII control characters, then clearly mark as user input
    const cleaned = value.replace(/[\x00-\x1F\x7F]/g, '');
    return `[USER] ${cleaned}`;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeLogValue(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        sanitizeLogValue(item),
      ]),
    );
  }

  return value;
};

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  //log requests
  console.log('\n==================== API REQUEST ====================');
  console.log(`[${new Date().toISOString()}]`);
  console.log(`Method: ${sanitizeLogValue(req.method)}`);
  console.log(`Path: ${sanitizeLogValue(req.path)}`);
  console.log(
    `Full URL: ${sanitizeLogValue(req.protocol)}://${sanitizeLogValue(req.get('host'))}${sanitizeLogValue(req.originalUrl)}`,
  );
  console.log(`IP: ${sanitizeLogValue(req.ip || req.socket.remoteAddress)}`);

  //log headers
  console.log('Headers:', {
    'content-type': sanitizeLogValue(req.get('content-type')),
    'user-agent': sanitizeLogValue(req.get('user-agent')),
    authorization: req.get('authorization') ? 'Bearer [REDACTED]' : 'None',
  });

  //log body
  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    if (sanitizedBody.confirmPassword) sanitizedBody.confirmPassword = '[REDACTED]';
    console.log('Body:', sanitizeLogValue(sanitizedBody));
  }

  if (req.query && Object.keys(req.query).length > 0) {
    console.log('Query:', sanitizeLogValue(req.query));
  }

  //response
  const originalSend = res.send;
  res.send = function (data: any): Response {
    const duration = Date.now() - startTime;

    console.log('\n==================== API RESPONSE ====================');
    console.log(`[${new Date().toISOString()}]`);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Duration: ${duration}ms`);

    try {
      const responseData = typeof data === 'string' ? JSON.parse(data) : data;
      const responsePreview = JSON.stringify(responseData).substring(0, 500);
      console.log(
        'Response Preview:',
        sanitizeLogValue(responsePreview) + (responsePreview.length >= 500 ? '...' : ''),
      );
    } catch {
      console.log('Response: [Non-JSON or Binary Data]');
    }

    console.log('====================================================\n');

    return originalSend.call(this, data);
  };

  next();
};

export const errorLogger = (err: any, req: Request, _res: Response, next: NextFunction) => {
  console.error('\n==================== API ERROR ====================');
  console.error(`[${new Date().toISOString()}]`);
  console.error(`Method: ${sanitizeLogValue(req.method)}`);
  console.error(`Path: ${sanitizeLogValue(req.path)}`);
  console.error(`Error Name: ${sanitizeLogValue(err.name)}`);
  console.error(`Error Message: ${sanitizeLogValue(err.message)}`);
  console.error(`Stack Trace:`, sanitizeLogValue(err.stack));
  console.error('====================================================\n');

  next(err);
};
