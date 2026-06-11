import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import env from '@config/env';
import corsOptions from '@config/cors';
import { httpLoggerMiddleware } from '@config/logger';
import requestIdMiddleware from '@middleware/requestId';
import apiRateLimiter from '@middleware/rateLimiter';
import { errorHandler, notFoundHandler } from '@middleware/errorHandler';
import apiRoutes from '@routes/index';

const app = express();

// Trust reverse proxies (important for rate limiters, cookies, and https redirect layers)
app.set('trust proxy', 1);

// 1. Security HTTP Headers
app.use(helmet());

// 2. Cross-Origin Resource Sharing
app.use(cors(corsOptions));

// 3. Gzip Compression
app.use(compression());

// 4. HTTP Logger Integration
app.use(httpLoggerMiddleware);

// 5. JSON Request Parser
app.use(express.json({ limit: '5mb' }));

// 6. URL Encoded Request Parser
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// 7. Request Tracing Header Middleware
app.use(requestIdMiddleware);

// 8. Global API Rate Limiter
app.use(apiRateLimiter);

// Mount Platform API Routes
app.use(env.API_PREFIX, apiRoutes);

// Catch-All 404 Route Mismatch Handler
app.use(notFoundHandler);

// Global Error Handler Middleware (MUST be last)
app.use(errorHandler);

export { app };
export default app;
