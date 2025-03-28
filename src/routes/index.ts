import { join } from 'node:path';

import type { FastifyPluginAsync } from 'fastify';
import autoLoad from '@fastify/autoload';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';

import openapi from '~/plugins/openapi';

import { errorHandler as r5ErrorHandler } from '~/lib/endpoint/r5';

const r5Router: FastifyPluginAsync = async (fastify) => {
  // Format errors as COUNTER 5 exceptions
  fastify.setErrorHandler(r5ErrorHandler);

  fastify.register(autoLoad, {
    dir: join(__dirname, 'r5'),
    maxDepth: 2,
    prefix: '/',
  });
};

const router: FastifyPluginAsync = async (fastify) => {
  // Set validator
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Register openapi and doc
  app.register(openapi, { transform: jsonSchemaTransform });

  // Register COUNTER versions
  app.register(r5Router);
};

export default router;
