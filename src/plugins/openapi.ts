import type { FastifyPluginAsync } from 'fastify';
import fastifySwagger, { type FastifyDynamicSwaggerOptions } from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fp from 'fastify-plugin';

import { version } from '../../package.json';

/*
 * Common API schemas
 */
export const schemas = {
  security: {
    user: [{ 'User Token': [] }],
    admin: [{ 'API Key': [] }],
  },
};

type PluginOptions = {
  transform?: FastifyDynamicSwaggerOptions['transform'],
  transformObject?: FastifyDynamicSwaggerOptions['transformObject'],
};

/**
 * Fastify plugin to setup openapi
 *
 * @param fastify The fastify instance
 */
const formatBasePlugin: FastifyPluginAsync<PluginOptions> = async (fastify, opts) => {
  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'COUNTER endpoint',
        version,
        contact: {
          name: 'ezTeam',
          url: 'https://github.com/ezpaarse-project',
          email: 'ezpaarse@couperin.org',
        },
        license: {
          name: 'CeCILL',
          url: 'https://github.com/ezpaarse-project/fake-counter-endpoint/blob/master/LICENSE.txt',
        },
        description: 'Simple COUNTER service to test harvests',
      },
      servers: [
        { url: '/', description: 'Direct' },
      ],
      tags: [
        { name: 'r5', description: 'COUNTER 5 Endpoints' },
        { name: 'r51', description: 'COUNTER 5.1 Endpoints' },
      ],
    },
    transformObject: opts.transformObject,
    transform: opts.transform,
  });

  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/doc',
  });
};

// Register plugin
const formatPlugin = fp(
  formatBasePlugin,
  { name: 'fee-openapi', encapsulate: false },
);

export default formatPlugin;
