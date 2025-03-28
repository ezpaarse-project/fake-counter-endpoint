import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';

import { AuthValidation } from '~/models/r5/auth';
import { exceptions, ExceptionValidation } from '~/models/r5/exceptions';
import {
  createReport,
  createReportHeader,
  Report,
  REPORT_IDS,
  REPORT_NAMES,
  ReportListItemValidation,
  ReportPeriodQueryValidation,
  type ReportID,
  type ReportListItem,
} from '~/models/r5/reports';

export const prepareReportListSchema = () => ({
  summary: 'Get list of reports supported by the API',
  tags: ['r5'],
  querystring: AuthValidation,
  response: {
    [StatusCodes.OK]: z.array(ReportListItemValidation),
    [StatusCodes.BAD_REQUEST]: ExceptionValidation,
    [StatusCodes.UNAUTHORIZED]: ExceptionValidation,
    [StatusCodes.FORBIDDEN]: ExceptionValidation,
  },
});

export function prepareReportListHandler(supported = REPORT_IDS) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<ReportListItem[]> => {
    reply.status(StatusCodes.OK);
    return supported.map((id) => ({
      Report_ID: id,
      Report_Name: REPORT_NAMES[id] ?? 'Unknown Report',
      Report_Description: 'Randomly generated report',
      Release: 5 as const,
    }));
  };
}

export function prepareReportSchema<Report>(
  reportId: ReportID,
  validation: z.ZodType<Report>,
) {
  return {
    summary: `Get COUNTER '${REPORT_NAMES[reportId]}' [${reportId}]`,
    tags: ['r5'],
    querystring: AuthValidation.and(ReportPeriodQueryValidation),
    response: {
      [StatusCodes.OK]: validation,
      [StatusCodes.BAD_REQUEST]: ExceptionValidation,
      [StatusCodes.UNAUTHORIZED]: ExceptionValidation,
      [StatusCodes.FORBIDDEN]: ExceptionValidation,
    },
  };
}

export function prepareReportHandler<ReportItem>(
  reportId: ReportID,
  reportItemsGenerator: (min?: number) => Promise<ReportItem[]>,
) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<Report<ReportItem>> => {
    const currentExceptions = [];
    let currentStatus = 200;

    const items = await reportItemsGenerator();

    if (items.length <= 0) {
      const { status, ...exception } = exceptions.noUsageAvailable;
      currentStatus = status;
      currentExceptions.push(exception);
    }

    const report = createReport(
      createReportHeader(
        reportId,
        [],
        undefined,
        undefined,
        currentExceptions,
      ),
      items,
    );

    reply.status(currentStatus);
    return report;
  };
}
