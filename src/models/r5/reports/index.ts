import { z } from 'zod';

import { ExceptionValidation, type Exception } from '../exceptions';

export const ReportItemValidation = z.object({
  Report_Name: z.string(),
  Report_ID: z.string(),
  Release: z.literal(5),
  Report_Description: z.string(),
  Path: z.string().optional(),
});

export type ReportItem = z.infer<typeof ReportItemValidation>;

export const ReportPeriodValidation = z.object({
  begin_date: z.string().regex(/[0-9]{4}-[0-9]{2}(-[0-9]{2})?/),
  end_date: z.string().regex(/[0-9]{4}-[0-9]{2}(-[0-9]{2})?/),
});

export type ReportPeriod = z.infer<typeof ReportPeriodValidation>;

const ReportInstitutionIDValidation = z.object({
  Type: z.enum(['ISNI', 'ISIL', 'OCLC', 'ROR', 'Proprietary'] as const),
  Value: z.string(),
});

type ReportInstitutionID = z.infer<typeof ReportInstitutionIDValidation>;

const ReportFilterValidation = z.object({
  Name: z.string(),
  Value: z.string(),
});

type ReportFilter = z.infer<typeof ReportFilterValidation>;

const ReportAttributesValidation = z.object({
  Name: z.string(),
  Value: z.string(),
});

type ReportAttributes = z.infer<typeof ReportAttributesValidation>;

export const ReportHeaderValidation = z.object({
  Created: z.string().datetime(),
  Created_By: z.string(),
  Customer_ID: z.string().optional(),
  Report_ID: z.string(), // TODO: Should be an enum
  Report_Name: z.string(),
  Release: z.literal('5'),
  Institution_Name: z.string(),
  Institution_ID: z.array(ReportInstitutionIDValidation).optional(),
  Report_Filters: z.array(ReportFilterValidation),
  Report_Attributes: z.array(ReportAttributesValidation).optional(),
  Exceptions: z.array(ExceptionValidation).optional(),
});

export type ReportHeader = z.infer<typeof ReportHeaderValidation>;

export function createReportHeader(
  Report_ID: string, // TODO: Should be an enum
  Report_Name: string,
  Report_Filters: ReportFilter[],
  Institution_ID?: ReportInstitutionID[],
  Report_Attributes?: ReportAttributes[],
  Exceptions?: Exception[],
): ReportHeader {
  return {
    Created: new Date().toISOString(),
    Created_By: 'Fake Counter Endpoint',
    Report_ID,
    Report_Name,
    Release: '5',
    Institution_Name: 'test',
    Institution_ID,
    Report_Filters,
    Report_Attributes,
    Exceptions,
  };
}
