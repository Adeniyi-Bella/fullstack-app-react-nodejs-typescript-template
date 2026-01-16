// src/server.ts
import { app } from './app';
import config from '@/config';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/mongoose';
import { logger, logtail } from '@/lib/winston';

// handleUncaughtException();
// handleUnhandledRejection();

void (async () => {
  try {
    await connectToDatabase('Server');

    app.listen(config.PORT, () => {
      logger.info(`Server running: http://localhost:${config.PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
})();

/* -------------------------------------------------------------------------- */
/*                           Graceful shutdown logic                            */
/* -------------------------------------------------------------------------- */
const shutdown = async () => {
  try {
    await disconnectFromDatabase('Server');

    await logtail!.flush();
    process.exit(0);
  } catch {
    process.exit(1);
  }
};

process.on('SIGTERM', () => void shutdown());
process.on('SIGINT', () => void shutdown());
