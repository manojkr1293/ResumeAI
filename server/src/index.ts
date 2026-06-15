// ─── Import Environment Config FIRST ──────────────────────────────────────────
//import env from './config/env'; // Triggers environment schema parsing

import http from 'http';
import app from './app';
import { connectDb, disconnectDb } from './config/database';
import logger from './config/logger';

let server: http.Server;

const startServer = async () => {
  console.log("STARTSERVER CALLED");

  try {
    console.log("BEFORE DB");

    await connectDb();

    console.log("AFTER DB");

    server = http.createServer(app);

    const PORT = Number(process.env.PORT ?? 5000);

    console.log("PORT:", PORT);

    server.listen(PORT, "0.0.0.0", () => {
      console.log("LISTENING");
    });
  } catch (error) {
    console.error("STARTUP ERROR:", error);
  }
};

// Handle uncaught code anomalies before crashing
process.on('uncaughtException', (error: Error) => {
  logger.error('💥 Uncaught Exception caught! Shutting down system safely...', error);
  process.exit(1);
});

// Handle unhandled Promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('💥 Unhandled Promise Rejection detected! Gracefully shutting down...', reason as Error);
  
  if (server) {
    server.close(() => {
      disconnectDb()
        .then(() => process.exit(1))
        .catch(() => process.exit(1));
    });
  } else {
    process.exit(1);
  }
});

// Setup Graceful OS interrupt listeners
const handleTerminationSignal = (signal: string) => {
  logger.info(`Received ${signal}. Shutting down application layers gracefully...`);
  
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      try {
        await disconnectDb();
        logger.info('MySQL database client disconnected successfully.');
        process.exit(0);
      } catch (err) {
        logger.error('Error during MySQL client disconnection:', err);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleTerminationSignal('SIGTERM'));
process.on('SIGINT', () => handleTerminationSignal('SIGINT'));

// Start server execution bootstrap
void startServer();
