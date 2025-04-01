import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { hasZodFastifySchemaValidationErrors, isResponseSerializationError } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { StatusCodes } from 'http-status-codes';

import { appLogger } from '~/lib/logger';

import { AuthValidation } from '~/models/r5/auth';
import { exceptions, ExceptionValidation, type Exception } from '~/models/r5/exceptions';
import { AnyReportFilterQueryValidation, ReportPeriodQueryValidation } from '~/models/r5/query';
import { generateFakeInstitutions, InstitutionValidation, type Institution } from '~/models/r5/institutions';
import { generateFakeStatus, StatusValidation, type Status } from '~/models/r5/status';
import * as r5 from '~/models/r5/reports';

/**
 * Format errors as COUNTER 5 exceptions
 *
 * @param err The error
 * @param request The request
 * @param reply The reply
 *
 * @returns Fastify instance after sending error
 */
export function errorHandler(err: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  let status: number;
  let exception: Exception;
  ({ status, ...exception } = exceptions.notAvailable);

  if (hasZodFastifySchemaValidationErrors(err)) {
    exception.Data = err.validation.map((v) => `${v.schemaPath} is ${v.message}`).join(', ');
    ({ status, ...exception } = exceptions.notEnoughInformation);
    appLogger.error({
      msg: 'Error serializing request',
      url: request.url,
      issues: err.validation,
    });
  }

  if (isResponseSerializationError(err)) {
    // We should raise a Not Available exception here
    // but for testing purposes, we return a custom exception
    exception = {
      Code: 500,
      Message: 'Generated invalid report',
      Severity: 'Fatal',
      Data: 'See logs of application for more details.',
    };
    appLogger.error({
      msg: 'Error serializing response',
      url: request.url,
      issues: err.cause.issues,
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

// Query validation for report list
const ReportListQueryValidation = AnyReportFilterQueryValidation
  .and(z.object({ search: z.string().optional() }));

/**
 * Prepare schema for report list routes
 *
 * @returns Schema for report list route
 */
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

/**
 * Prepare handler for report list routes
 *
 * @param supported Supported reports, can be unrelated to actual routes
 * (in case of a faulty endpoint)
 *
 * @returns Handler for report list route
 */
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

/**
 * Parse report attributes from query
 *
 * @param query The query
 *
 * @returns Report attributes
 */
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

/**
 * Parse report filters from query
 *
 * @param query The query
 *
 * @returns Report filters
 */
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

/**
 * Pick a random non-blocking exception
 *
 * @returns Non-blocking exception, or nothing if there are no non-blocking exceptions
 */
function pickRandomNonBlockingException(): Exception | undefined {
  const shouldPick = Math.random() < 0.25;
  if (!shouldPick) {
    return undefined;
  }

  const nonBlockingExceptions = [
    exceptions.noUsageReady,
    exceptions.noUsageLongerAvailable,
    exceptions.partialData,
    exceptions.parameterNotRecognized,
    exceptions.invalidFilter,
    exceptions.incongruousFilter,
    exceptions.invalidAttribute,
  ];
  const index = Math.floor(Math.random() * nonBlockingExceptions.length);
  return nonBlockingExceptions[index];
}

/**
 * Prepare schema for report routes
 *
 * @param reportId The report id
 * @param resultValidation The validation for the result
 * @param queryValidation The additional validation for the query
 *
 * @returns Schema for report route
 */
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
      [StatusCodes.NOT_FOUND]: ExceptionValidation,
      [StatusCodes.BAD_REQUEST]: ExceptionValidation,
      [StatusCodes.UNAUTHORIZED]: ExceptionValidation,
      [StatusCodes.FORBIDDEN]: ExceptionValidation,
    },
  };
}

/**
 * Prepare handler for report routes
 *
 * @param reportId The report id
 * @param reportItemsGenerator The generator for report items
 * @param queryValidation The additional validation for the query
 *
 * @returns Handler for report route
 */
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

/**
 * Prepare schema for unsupported report
 *
 * @returns Schema for unsupported report
 */
export function prepareUnsupportedReportSchema() {
  return {
    summary: 'Unsupported reports',
    hide: true, // hide from docs
    tags: ['r5'],
    response: {
      [StatusCodes.NOT_FOUND]: ExceptionValidation,
      [StatusCodes.BAD_REQUEST]: ExceptionValidation,
      [StatusCodes.UNAUTHORIZED]: ExceptionValidation,
      [StatusCodes.FORBIDDEN]: ExceptionValidation,
    },
  };
}

/**
 * Prepare handler for unsupported report
 *
 * @returns Handler for unsupported report
 */
export function prepareUnsupportedHandler() {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<Exception> => {
    const { status, ...exception } = exceptions.reportNotSupported;
    reply.status(status);
    return exception;
  };
}

/**
 * Prepare schema for member list routes
 *
 * @returns Schema for memberlist route
 */
export function prepareMemberListSchema() {
  return {
    summary: 'Get list of consortium members related to a Customer_ID',
    tags: ['r5'],
    querystring: AnyReportFilterQueryValidation,
    response: {
      [StatusCodes.OK]: z.array(InstitutionValidation),
      [StatusCodes.BAD_REQUEST]: ExceptionValidation,
      [StatusCodes.UNAUTHORIZED]: ExceptionValidation,
      [StatusCodes.FORBIDDEN]: ExceptionValidation,
    },
  };
}

/**
 * Prepare handler for member list routes
 *
 * @returns Handler for member list route
 */
export function prepareMemberListHandler() {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<Institution[]> => {
    reply.status(StatusCodes.OK);
    return generateFakeInstitutions();
  };
}

/**
 * Prepare schema for status routes
 *
 * @returns Schema for status route
 */
export function prepareStatusSchema() {
  return {
    summary: 'Get current status of the reporting service',
    tags: ['r5'],
    querystring: AnyReportFilterQueryValidation,
    response: {
      [StatusCodes.OK]: z.array(StatusValidation),
      [StatusCodes.BAD_REQUEST]: ExceptionValidation,
      [StatusCodes.UNAUTHORIZED]: ExceptionValidation,
      [StatusCodes.FORBIDDEN]: ExceptionValidation,
    },
  };
}

/**
 * Prepare handler for status routes
 *
 * @returns Handler for status route
 */
export function prepareStatusHandler() {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<Status[]> => {
    reply.status(StatusCodes.OK);
    return generateFakeStatus();
  };
}
