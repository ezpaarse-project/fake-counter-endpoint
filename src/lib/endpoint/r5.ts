import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { hasZodFastifySchemaValidationErrors, isResponseSerializationError } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';

import { appLogger } from '~/lib/logger';

import { AuthValidation } from '~/models/r5/auth';
import { exceptions, ExceptionValidation, type Exception } from '~/models/r5/exceptions';
import { AnyReportFilterQueryValidation, ReportPeriodQueryValidation } from '~/models/r5/query';
import * as r5 from '~/models/r5/reports';

export function errorHandler(err: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  let status: number;
  let exception: Exception;
  ({ status, ...exception } = exceptions.noAvailable);

  if (hasZodFastifySchemaValidationErrors(err)) {
    exception.Data = err.validation.map((v) => `${v.schemaPath} is ${v.message}`).join(', ');
    ({ status, ...exception } = exceptions.noEnoughInfo);
  }
  if (isResponseSerializationError(err)) {
    exception.Data = 'Error serializing response. See logs of application for more details.';
    appLogger.error({
      msg: 'Error serializing response',
      err: err.cause.issues,
    });
  }

  if (!exception.Data) {
    exception.Data = 'Unexpected error. See logs of application for more details.';
    appLogger.error({
      msg: 'Unexpected error',
      err,
    });
  }

  return reply.status(status).send(exception);
}

const ReportListQueryValidation = AnyReportFilterQueryValidation
  .and(z.object({ search: z.string().optional() }));

export const prepareReportListSchema = () => ({
  summary: 'Get list of reports supported by the API',
  tags: ['r5'],
  querystring: AuthValidation
    .and(ReportListQueryValidation),
  response: {
    [StatusCodes.OK]: z.array(r5.ReportListItemValidation),
    [StatusCodes.BAD_REQUEST]: ExceptionValidation,
    [StatusCodes.UNAUTHORIZED]: ExceptionValidation,
    [StatusCodes.FORBIDDEN]: ExceptionValidation,
  },
});

export function prepareReportListHandler(supported: string[] = Array.from(r5.REPORT_IDS)) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<r5.ReportListItem[]> => {
    const query = ReportListQueryValidation.parse(request.query);

    const reports = supported.map((id) => ({
      Report_ID: id,
      Report_Name: r5.isReportId(id) ? r5.REPORT_NAMES[id] : 'Unknown Report',
      Report_Description: 'Randomly generated report',
      Release: 5 as const,
    }));

    reply.status(StatusCodes.OK);
    return reports.filter(
      (report) => report.Report_Name.toLowerCase().includes(query.search?.toLowerCase() || ''),
    );
  };
}

function attributesFromQuery<Query extends Record<string, string>>(
  query: Query,
): r5.ReportAttribute[] {
  const attributes: r5.ReportAttribute[] = [];

  if (query.access_method) {
    attributes.push({ Name: 'Access_Methods', Value: query.access_method });
  }
  if (query.attributes_to_show) {
    attributes.push({ Name: 'Attribute_To_Shows', Value: query.attributes_to_show });
  }
  if (query.granularity) {
    attributes.push({ Name: 'Granularity', Value: query.granularity });
  }

  return attributes;
}

function filtersFromQuery<Query extends Record<string, string>>(query: Query): r5.ReportFilter[] {
  const filters: r5.ReportAttribute[] = [];

  if (query.begin_date) {
    filters.push({ Name: 'Begin_Date', Value: query.begin_date });
  }
  if (query.end_date) {
    filters.push({ Name: 'End_Date', Value: query.end_date });
  }
  if (query.metric_type) {
    filters.push({ Name: 'Metric_Types', Value: query.metric_type });
  }
  if (query.data_type) {
    filters.push({ Name: 'Data_Types', Value: query.data_type });
  }
  if (query.access_method) {
    filters.push({ Name: 'Access_Methods', Value: query.access_method });
  }

  return filters;
}

function pickRandomNonBlockingException(): Exception | undefined {
  return undefined;
}

export function prepareReportSchema<AnyReport, Query>(
  reportId: r5.ReportID,
  resultValidation: z.ZodType<AnyReport>,
  queryValidation?: z.ZodType<Query>,
) {
  return {
    summary: `Get COUNTER '${r5.REPORT_NAMES[reportId]}' [${reportId}]`,
    tags: ['r5'],
    querystring: AuthValidation
      .and(ReportPeriodQueryValidation)
      .and(queryValidation || AnyReportFilterQueryValidation),
    response: {
      [StatusCodes.OK]: resultValidation,
      [StatusCodes.BAD_REQUEST]: ExceptionValidation,
      [StatusCodes.UNAUTHORIZED]: ExceptionValidation,
      [StatusCodes.FORBIDDEN]: ExceptionValidation,
    },
  };
}

export function prepareReportHandler<ReportItem, Query>(
  reportId: r5.ReportID,
  reportItemsGenerator: r5.ReportItemsGenerator<ReportItem>,
  queryValidation?: z.ZodType<Query>,
) {
  const queryValidator = ReportPeriodQueryValidation
    .and(queryValidation || AnyReportFilterQueryValidation);

  return async (request: FastifyRequest, reply: FastifyReply): Promise<r5.Report<ReportItem>> => {
    const query = queryValidator.parse(request.query);

    const currentExceptions: Exception[] = [];
    const attributes = attributesFromQuery(query);
    const filters = filtersFromQuery(query);

    // TODO: apply filters

    const items = await reportItemsGenerator();

    if (items.length <= 0) {
      const { status, ...exception } = exceptions.noUsageAvailable;
      currentExceptions.push(exception);
    }

    if (currentExceptions.length <= 0) {
      const exception = pickRandomNonBlockingException();
      if (exception) {
        currentExceptions.push(exception);
      }
    }

    const report = r5.createReport(
      await r5.createReportHeader(reportId, filters, attributes, currentExceptions),
      items,
    );

    reply.status(StatusCodes.OK);
    return report;
  };
}
