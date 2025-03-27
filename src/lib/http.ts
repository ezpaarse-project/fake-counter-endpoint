import Fastify, { type FastifyPluginAsync } from 'fastify';
import fastifyCors from '@fastify/cors';

import { appLogger } from '~/lib/logger';
import config from '~/lib/config';

import loggerPlugin from '~/plugins/logger';

const { port, allowedOrigins } = config;
const logger = appLogger.child({ scope: 'http' });

const corsOrigin: '*' | string[] = allowedOrigins === '*' ? '*' : allowedOrigins.split(',');

export default async function startHTTPServer(routes: FastifyPluginAsync) {
  const start = process.uptime();

  // Create Fastify instance
  const fastify = Fastify({ logger: false });

  // Register cors
  await fastify.register(fastifyCors, { origin: corsOrigin });

  // Register logger
  await fastify.register(loggerPlugin);

  // Register routes
  await fastify.register(routes);

  // Start server and wait for it to be ready
  const address = await fastify.listen({ port, host: '::' });
  await fastify.ready();

  // Register graceful shutdown
  process.on('SIGTERM', () => {
    fastify.close()
      .then(() => logger.debug('Service HTTP closed'))
      .catch((err) => logger.error({ msg: 'Failed to close HTTP service', err }));
  });

  logger.info({
    address,
    port,
    initDuration: process.uptime() - start,
    initDurationUnit: 's',
    msg: 'Service listening',
  });

  return fastify;
}
