import { Request, Response, NextFunction } from 'express';

const sanitizeLogValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  // Remove CR/LF and other ASCII control characters to prevent log injection/forgery.
  return str.replace(/[\r\n\x00-\x1F\x7F]+/g, ' ');
};

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  //log requests
  console.log('\n==================== API REQUEST ====================');
  console.log(`[${new Date().toISOString()}]`);
  console.log(`Method: ${sanitizeLogValue(req.method)}`);
  console.log(`Path: ${sanitizeLogValue(req.path)}`);
  const fullUrl = `Full URL: ${req.protocol}://${req.get('host') || ''}${req.originalUrl}`;
  console.log(sanitizeLogValue(fullUrl));
  console.log(`IP: ${sanitizeLogValue(req.ip || req.socket.remoteAddress || '')}`);

  //log headers
  console.log('Headers:', {
    'content-type': sanitizeLogValue(req.get('content-type') || ''),
    'user-agent': sanitizeLogValue(req.get('user-agent') || ''),
    authorization: req.get('authorization') ? 'Bearer [REDACTED]' : 'None',
  });

  //log body
  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = JSON.parse(JSON.stringify(req.body)) as Record<string, unknown>;
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    if (sanitizedBody.confirmPassword) sanitizedBody.confirmPassword = '[REDACTED]';
    console.log('Body:', sanitizeLogValue(JSON.stringify(sanitizedBody)));
  }

  if (req.query && Object.keys(req.query).length > 0) {
    console.log('Query:', sanitizeLogValue(JSON.stringify(req.query)));
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
        sanitizeLogValue(responsePreview + (responsePreview.length >= 500 ? '...' : '')),
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
  console.error(`Error Name: ${sanitizeLogValue(err?.name || 'Error')}`);
  console.error(`Error Message: ${sanitizeLogValue(err?.message || 'Unknown error')}`);
  console.error(`Stack Trace: ${sanitizeLogValue(err?.stack ? err.stack : 'None')}`);
  console.error('====================================================\n');

  next(err);
};
