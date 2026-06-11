import type { CorsOptions } from 'cors';
import env from './env';

const parseAllowedOrigins = (originStr: string): string[] | string => {
  if (originStr === '*') {
    return '*';
  }
  const origins = originStr.split(',').map((o) => o.trim());
  // Add browser preview origins for development
  origins.push('http://127.0.0.1:57419', 'http://127.0.0.1:63377');
  return origins;
};

const allowedOrigins = parseAllowedOrigins(env.CORS_ORIGIN);

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server or postman requests (origin is undefined)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins === '*') {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy violation: Origin '${origin}' is not authorized.`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Request-ID',
    'X-Session-ID',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['X-Request-ID'],
  credentials: true,
  maxAge: 86400, // 24 hours in cache
  optionsSuccessStatus: 204,
};

export default corsOptions;
