import { appLogger } from '~/lib/logger';
import config from '~/lib/config';
import startHTTPServer from '~/lib/http';

import routes from '~/routes';

const start = async () => {
  appLogger.info({
    scope: 'node',
    env: process.env.NODE_ENV,
    logLevel: config.log.level,
    logDir: config.log.dir,
    msg: 'Service starting',
  });

  try {
    await startHTTPServer(routes);

    appLogger.info({
      scope: 'init',
      readyDuration: process.uptime(),
      readyDurationUnit: 's',
      msg: 'Service ready',
    });
  } catch (err) {
    appLogger.error(err);
    process.exit(1);
  }
};
start();
