import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

export const ExceptionValidation = z.object({
  Code: z.number().int(),
  Severity: z.enum(['Warning', 'Error', 'Fatal', 'Debug', 'Info'] as const),
  Message: z.string(),
  Help_URL: z.string().optional(),
  Data: z.string().optional(),
});

export type Exception = z.infer<typeof ExceptionValidation>;

// Common COUNTER exceptions
export const exceptions = {
  notAvailable: {
    Code: 1000,
    Message: 'Service Not Available',
    Severity: 'Fatal',

    status: StatusCodes.SERVICE_UNAVAILABLE,
  },
  busy: {
    Code: 1010,
    Message: 'Service Busy',
    Severity: 'Fatal',

    status: StatusCodes.SERVICE_UNAVAILABLE,
  },
  queued: {
    Code: 1011,
    Message: 'Report Queued for Processing',
    Severity: 'Warning',

    status: StatusCodes.ACCEPTED,
  },
  tooManyRequests: {
    Code: 1020,
    Message: 'Client has made too many requests',
    Severity: 'Fatal',

    status: StatusCodes.TOO_MANY_REQUESTS,
  },
  notEnoughInformation: {
    Code: 1030,
    Message: 'Insufficient Information to Process Request',
    Severity: 'Fatal',

    status: StatusCodes.BAD_REQUEST,
  },
  requestorNotAuthorized: {
    Code: 2000,
    Message: 'Requestor Not Authorized to Access Service',
    Severity: 'Error',

    status: StatusCodes.UNAUTHORIZED,
  },
  customerNotAuthorized: {
    Code: 2010,
    Message: 'Requestor is Not Authorized to Access Usage for Institution',
    Severity: 'Error',

    status: StatusCodes.FORBIDDEN,
  },
  apiNotAuthorized: {
    Code: 2020,
    Message: 'APIKey Invalid',
    Severity: 'Error',

    status: StatusCodes.UNAUTHORIZED,
  },
  ipNotAuthorized: {
    Code: 2030,
    Message: 'IP Address Not Authorized to Access Service',
    Severity: 'Error',

    status: StatusCodes.UNAUTHORIZED,
  },
  reportNotSupported: {
    Code: 3000,
    Message: 'Report Not Supported',
    Severity: 'Error',

    status: StatusCodes.NOT_FOUND,
  },
  reportVersionNotSupported: {
    Code: 3010,
    Message: 'Report Version Not Supported',
    Severity: 'Error',

    status: StatusCodes.NOT_FOUND,
  },
  invalidDate: {
    Code: 3020,
    Message: 'Invalid Date Arguments',
    Severity: 'Error',

    status: StatusCodes.BAD_REQUEST,
  },
  noUsageAvailable: {
    Code: 3030,
    Message: 'No Usage Available for Requested Dates',
    Severity: 'Error',

    status: StatusCodes.OK,
  },
  noUsageReady: {
    Code: 3031,
    Message: 'Usage Not Ready for Requested Dates',
    Severity: 'Warning',

    status: StatusCodes.OK,
  },
  noUsageLongerAvailable: {
    Code: 3032,
    Message: 'Usage No Longer Available for Requested Dates',
    Severity: 'Warning',

    status: StatusCodes.OK,
  },
  partialData: {
    Code: 3040,
    Message: 'Partial Data Returned',
    Severity: 'Warning',

    status: StatusCodes.OK,
  },
  parameterNotRecognized: {
    Code: 3050,
    Message: 'Parameter Not Recognized in this Context',
    Severity: 'Warning',

    status: StatusCodes.OK,
  },
  invalidFilter: {
    Code: 3060,
    Message: 'Invalid ReportFilter Value',
    Severity: 'Warning',

    status: StatusCodes.OK,
  },
  incongruousFilter: {
    Code: 3061,
    Message: 'Incongruous ReportFilter Value',
    Severity: 'Warning',

    status: StatusCodes.OK,
  },
  invalidAttribute: {
    Code: 3062,
    Message: 'Invalid ReportAttribute Value',
    Severity: 'Warning',

    status: StatusCodes.OK,
  },
} as const satisfies Record<string, Exception & { status: StatusCodes }>;
