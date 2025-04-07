import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

import { requireCustomerId } from '~/plugins/auth';

import {
  prepareStatusSchema,
  prepareStatusHandler,
  prepareMemberListSchema,
  prepareMemberListHandler,
  prepareReportListSchema,
  prepareReportListHandler,
  prepareReportSchema,
  prepareReportHandler,
  prepareUnsupportedReportSchema,
  prepareUnsupportedHandler,
} from '~/lib/endpoint/r5';

import { generateFakePlatformUsage, PlatformReportValidation } from '~/models/r5/reports/PR';
import { generateFakeDatabaseUsage, DatabaseReportValidation } from '~/models/r5/reports/DR';
import { generateFakeItemUsage, ItemReportValidation } from '~/models/r5/reports/IR';
import {
  MasterReportFiltersQueryValidation,
  DatabaseReportFiltersQueryValidation,
  ItemReportFiltersQueryValidation,
} from '~/models/r5/query';

// This router is the standard one, and should work (almost) like a functional
// and valid COUNTER 5 endpoint, but with a inaccurate report list
// https://app.swaggerhub.com/apis/COUNTER/counter-sushi_5_0_api/

const router: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    method: 'GET',
    url: '/status',
    schema: prepareStatusSchema(),
    preValidation: [
      requireCustomerId(),
    ],
    handler: prepareStatusHandler(),
  });

  fastify.route({
    method: 'GET',
    url: '/members',
    schema: prepareMemberListSchema(),
    preValidation: [
      requireCustomerId(),
    ],
    handler: prepareMemberListHandler(),
  });

  fastify.route({
    method: 'GET',
    url: '/reports',
    schema: prepareReportListSchema(),
    preValidation: [
      requireCustomerId(),
    ],
    handler: prepareReportListHandler(['PR', 'DR', 'TR']),
  });

  fastify.route({
    method: 'GET',
    url: '/reports/pr',
    schema: prepareReportSchema(
      'PR',
      PlatformReportValidation,
      MasterReportFiltersQueryValidation,
    ),
    preValidation: [
      requireCustomerId(),
    ],
    handler: prepareReportHandler(
      'PR',
      generateFakePlatformUsage,
      MasterReportFiltersQueryValidation,
    ),
  });

  fastify.route({
    method: 'GET',
    url: '/reports/pr_p1',
    schema: prepareReportSchema(
      'PR_P1',
      PlatformReportValidation,
    ),
    preValidation: [
      requireCustomerId(),
    ],
    handler: prepareReportHandler(
      'PR_P1',
      generateFakePlatformUsage,
    ),
  });

  fastify.route({
    method: 'GET',
    url: '/reports/dr',
    schema: prepareReportSchema(
      'DR',
      DatabaseReportValidation,
      DatabaseReportFiltersQueryValidation,
    ),
    preValidation: [
      requireCustomerId(),
    ],
    handler: prepareReportHandler(
      'DR',
      generateFakeDatabaseUsage,
      DatabaseReportFiltersQueryValidation,
    ),
  });

  fastify.route({
    method: 'GET',
    url: '/reports/dr_d1',
    schema: prepareReportSchema(
      'DR_D1',
      PlatformReportValidation,
    ),
    preValidation: [
      requireCustomerId(),
    ],
    handler: prepareReportHandler(
      'DR_D1',
      generateFakePlatformUsage,
    ),
  });

  fastify.route({
    method: 'GET',
    url: '/reports/dr_d2',
    schema: prepareReportSchema(
      'DR_D2',
      PlatformReportValidation,
    ),
    preValidation: [
      requireCustomerId(),
    ],
    handler: prepareReportHandler(
      'DR_D2',
      generateFakePlatformUsage,
    ),
  });

  fastify.route({
    method: 'GET',
    url: '/reports/ir',
    schema: prepareReportSchema(
      'IR',
      ItemReportValidation,
      ItemReportFiltersQueryValidation,
    ),
    preValidation: [
      requireCustomerId(),
    ],
    handler: prepareReportHandler(
      'IR',
      generateFakeItemUsage,
      ItemReportFiltersQueryValidation,
    ),
  });

  fastify.route({
    method: 'GET',
    url: '/reports/ir_a1',
    schema: prepareReportSchema(
      'IR_A1',
      ItemReportValidation,
    ),
    preValidation: [
      requireCustomerId(),
    ],
    handler: prepareReportHandler(
      'IR_A1',
      generateFakeItemUsage,
    ),
  });

  fastify.route({
    method: 'GET',
    url: '/reports/ir_m1',
    schema: prepareReportSchema(
      'IR_M1',
      ItemReportValidation,
    ),
    preValidation: [
      requireCustomerId(),
    ],
    handler: prepareReportHandler(
      'IR_M1',
      generateFakeItemUsage,
    ),
  });

  fastify.route({
    method: 'GET',
    url: '/reports/:reportId',
    schema: prepareUnsupportedReportSchema(),
    preValidation: [
      requireCustomerId(),
    ],
    handler: prepareUnsupportedHandler(),
  });
};

export default router;
