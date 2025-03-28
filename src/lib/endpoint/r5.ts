import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';

import { AuthValidation } from '~/models/r5/auth';
import { exceptions, ExceptionValidation, type Exception } from '~/models/r5/exceptions';
import { AnyReportFilterQueryValidation, ReportPeriodQueryValidation } from '~/models/r5/query';
import {
  isReportId,
  createReport,
  createReportHeader,
  REPORT_IDS,
  REPORT_NAMES,
  ReportListItemValidation,
  type Report,
  type ReportID,
  type ReportListItem,
  type ReportFilter,
  type ReportAttribute,
  type ReportItemsGenerator,
} from '~/models/r5/reports';

const ReportListQueryValidation = AnyReportFilterQueryValidation
  .and(z.object({ search: z.string().optional() }));

export const prepareReportListSchema = () => ({
  summary: 'Get list of reports supported by the API',
  tags: ['r5'],
  querystring: AuthValidation
    .and(ReportListQueryValidation),
  response: {
    [StatusCodes.OK]: z.array(ReportListItemValidation),
    [StatusCodes.BAD_REQUEST]: ExceptionValidation,
    [StatusCodes.UNAUTHORIZED]: ExceptionValidation,
    [StatusCodes.FORBIDDEN]: ExceptionValidation,
  },
});

export function prepareReportListHandler(supported: string[] = Array.from(REPORT_IDS)) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<ReportListItem[]> => {
    const query = ReportListQueryValidation.parse(request.query);

    const reports = supported.map((id) => ({
      Report_ID: id,
      Report_Name: isReportId(id) ? REPORT_NAMES[id] : 'Unknown Report',
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
): ReportAttribute[] {
  const attributes: ReportAttribute[] = [];

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

function filtersFromQuery<Query extends Record<string, string>>(query: Query): ReportFilter[] {
  const filters: ReportAttribute[] = [];

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
  reportId: ReportID,
  resultValidation: z.ZodType<AnyReport>,
  queryValidation?: z.ZodType<Query>,
) {
  return {
    summary: `Get COUNTER '${REPORT_NAMES[reportId]}' [${reportId}]`,
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
  reportId: ReportID,
  reportItemsGenerator: ReportItemsGenerator<ReportItem>,
  queryValidation?: z.ZodType<Query>,
) {
  const queryValidator = ReportPeriodQueryValidation
    .and(queryValidation || AnyReportFilterQueryValidation);

  return async (request: FastifyRequest, reply: FastifyReply): Promise<Report<ReportItem>> => {
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

    const report = createReport(
      await createReportHeader(reportId, filters, attributes, currentExceptions),
      items,
    );

    reply.status(StatusCodes.OK);
    return report;
  };
}
