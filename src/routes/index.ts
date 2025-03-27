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

const router: FastifyPluginAsync = async (fastify) => {
  // Set validator
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Register openapi and doc
  app.register(openapi, { transform: jsonSchemaTransform });

  // Register routes
  app.register(autoLoad, {
    dir: join(__dirname, 'r5'),
    maxDepth: 2,
    prefix: '/',
  });
};

export default router;
