import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

import { requireCustomerId } from '~/plugins/auth';

import { AuthValidation } from '~/models/r5/auth';
import { createReportHeader, ReportItemValidation, ReportPeriodValidation } from '~/models/r5/reports';
import { createPlatformReport, PlatformReportValidation } from '~/models/r5/reports/PR';
import { exceptions, ExceptionValidation } from '~/models/r5/exceptions';

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
      querystring: AuthValidation,
      response: {
        [StatusCodes.OK]: z.array(ReportItemValidation),
        [StatusCodes.FORBIDDEN]: ExceptionValidation,
      },
    },
    preValidation: [
      requireCustomerId(),
    ],
    handler: async (request, reply) => {
      reply.status(StatusCodes.OK);
      return [];
    },
  });

  fastify.route({
    method: 'GET',
    url: '/reports/pr',
    schema: {
      summary: "Get COUNTER 'Platform Master Report' [PR]",
      tags: ['r5'],
      querystring: AuthValidation.and(ReportPeriodValidation),
      response: {
        [StatusCodes.OK]: PlatformReportValidation,
        [StatusCodes.FORBIDDEN]: ExceptionValidation,
      },
    },
    preValidation: [
      requireCustomerId(),
    ],
    handler: async (request, reply) => {
      const { status, ...exception } = exceptions.noReport;

      const report = createPlatformReport(
        createReportHeader(
          'PR',
          'Platform Report',
          [],
          undefined,
          undefined,
          [exception],
        ),
      );

      reply.status(status);
      reply.send(report);
    },
  });

  // TODO: Support status
  // TODO: Support reports
  // TODO: Support members
};

export default router;
