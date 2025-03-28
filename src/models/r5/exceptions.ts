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

export const exceptions = {
  noAvailable: {
    Code: 1000,
    Message: 'Service Not Available',
    Severity: 'Fatal',

    status: StatusCodes.SERVICE_UNAVAILABLE,
  },
  noEnoughInfo: {
    Code: 1030,
    Message: 'Insufficient Information to Process Request',
    Severity: 'Fatal',

    status: StatusCodes.BAD_REQUEST,
  },
  noRequestor: {
    Code: 2000,
    Message: 'Requestor Not Authorized to Access Service',
    Severity: 'Error',

    status: StatusCodes.UNAUTHORIZED,
  },
  noCustomer: {
    Code: 2010,
    Message: 'Requestor is Not Authorized to Access Usage for Institution',
    Severity: 'Error',

    status: StatusCodes.FORBIDDEN,
  },
  noApi: {
    Code: 2020,
    Message: 'APIKey Invalid',
    Severity: 'Error',

    status: StatusCodes.UNAUTHORIZED,
  },
  noIP: {
    Code: 2020,
    Message: 'IP Address Not Authorized to Access Service',
    Severity: 'Error',

    status: StatusCodes.UNAUTHORIZED,
  },
  noReport: {
    Code: 3000,
    Message: 'Report Not Supported',
    Severity: 'Error',

    status: StatusCodes.NOT_FOUND,
  },
  noUsageAvailable: {
    Code: 3030,
    Message: 'No Usage Available for Requested Dates',
    Severity: 'Error',

    status: StatusCodes.OK,
  },
} as const satisfies Record<string, Exception & { status: StatusCodes }>;
