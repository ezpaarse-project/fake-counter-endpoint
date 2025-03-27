import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

import { ReportItemValidation } from '~/models/r5/reports';

// This router is the standard one, and should work (almost) like a functional
// and valid COUNTER 5 endpoint
// https://app.swaggerhub.com/apis/COUNTER/counter-sushi_5_0_api/

const router: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    method: 'GET',
    url: '/reports',
    schema: {
      summary: 'Get list of reports supported by the API',
      tags: ['r5'],
      response: {
        [StatusCodes.OK]: z.array(ReportItemValidation),
      },
    },
    handler: async (request, reply) => {
      reply.status(StatusCodes.OK);
      return [];
    },
  });

  // TODO: Support status
  // TODO: Support reports
  // TODO: Auth
  // TODO: Support members
};

export default router;
