import { z } from 'zod';

export const ExceptionValidation = z.object({
  Code: z.number().int(), // TODO: Restrict to some values
  Severity: z.string(), // TODO: Restrict to some values
  Message: z.string(),
  Help_URL: z.string().optional(),
  Data: z.string().optional(),
});

export type Exception = z.infer<typeof ExceptionValidation>;

export const exceptions = {
  noAuth: {
    Code: 1030,
    Message: 'Insufficient Information to Process Request',
    Severity: 'Fatal',

    status: 400,
  },
  noRequestor: {
    Code: 2000,
    Message: 'Requestor Not Authorized to Access Service',
    Severity: 'Error',

    status: 401,
  },
  noCustomer: {
    Code: 2010,
    Message: 'Requestor is Not Authorized to Access Usage for Institution',
    Severity: 'Error',

    status: 403,
  },
  noApi: {
    Code: 2020,
    Message: 'APIKey Invalid',
    Severity: 'Error',

    status: 401,
  },
  noIP: {
    Code: 2020,
    Message: 'IP Address Not Authorized to Access Service',
    Severity: 'Error',

    status: 401,
  },
  noReport: {
    Code: 3000,
    Message: 'Report Not Supported',
    Severity: 'Error',

    status: 404,
  },
} as const satisfies Record<string, Exception & { status: number }>;
