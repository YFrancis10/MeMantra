import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  //log requests
  console.log('\n==================== API REQUEST ====================');
  console.log(`[${new Date().toISOString()}]`);
  console.log(`Method: ${req.method.replaceAll(/[\r\n\u2028\u2029]+/g, ' ')}`);
  console.log(`Path: ${req.path.replaceAll(/[\r\n\u2028\u2029]+/g, ' ')}`);
  const fullUrl = `Full URL: ${req.protocol.replaceAll(/[\r\n\u2028\u2029]+/g, ' ')}://${(
    req.get('host') || ''
  ).replaceAll(
    /[\r\n\u2028\u2029]+/g,
    ' ',
  )}${req.originalUrl.replaceAll(/[\r\n\u2028\u2029]+/g, ' ')}`;
  console.log(fullUrl);
  console.log(
    `IP: ${(req.ip || req.socket.remoteAddress || '').replaceAll(/[\r\n\u2028\u2029]+/g, ' ')}`,
  );

  //log headers
  console.log('Headers:', {
    'content-type': (req.get('content-type') || '').replaceAll(/[\r\n\u2028\u2029]+/g, ' '),
    'user-agent': (req.get('user-agent') || '').replaceAll(/[\r\n\u2028\u2029]+/g, ' '),
    authorization: req.get('authorization') ? 'Bearer [REDACTED]' : 'None',
  });

  //log body
  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = Array.isArray(req.body)
      ? [...req.body]
      : ({ ...req.body } as Record<string, unknown>);
    if (sanitizedBody && !Array.isArray(sanitizedBody) && typeof sanitizedBody === 'object') {
      if ('password' in sanitizedBody) sanitizedBody.password = '[REDACTED]';
      if ('confirmPassword' in sanitizedBody) sanitizedBody.confirmPassword = '[REDACTED]';
    }
    try {
      console.log('Body:', JSON.stringify(sanitizedBody).replaceAll(/[\r\n\u2028\u2029]+/g, ' '));
    } catch {
      console.log('Body: [Unserializable Body]');
    }
  }

  if (req.query && Object.keys(req.query).length > 0) {
    try {
      console.log('Query:', JSON.stringify(req.query).replaceAll(/[\r\n\u2028\u2029]+/g, ' '));
    } catch {
      console.log('Query: [Unserializable Query]');
    }
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
        (responsePreview + (responsePreview.length >= 500 ? '...' : '')).replaceAll(
          /[\r\n\u2028\u2029]+/g,
          ' ',
        ),
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
  console.error(`Method: ${req.method.replaceAll(/[\r\n\u2028\u2029]+/g, ' ')}`);
  console.error(`Path: ${req.path.replaceAll(/[\r\n\u2028\u2029]+/g, ' ')}`);
  console.error(`Error Name: ${(err?.name || 'Error').replaceAll(/[\r\n\u2028\u2029]+/g, ' ')}`);
  console.error(
    `Error Message: ${(err?.message || 'Unknown error').replaceAll(/[\r\n\u2028\u2029]+/g, ' ')}`,
  );
  console.error(
    `Stack Trace: ${(err?.stack ? err.stack : 'None').replaceAll(/[\r\n\u2028\u2029]+/g, ' ')}`,
  );
  console.error('====================================================\n');

  next(err);
};
