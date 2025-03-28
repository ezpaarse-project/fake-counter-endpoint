import { z } from 'zod';

import { ExceptionValidation, type Exception } from '../exceptions';

export const REPORT_IDS = [
  'PR',
  'PR_P1',
  'DR',
  'DR_D1',
  'DR_D2',
  'TR',
  'TR_B1',
  'TR_B2',
  'TR_B3',
  'TR_J1',
  'TR_J2',
  'TR_J3',
  'TR_J4',
  'IR',
  'IR_A1',
  'IR_M1',
] as const;

export const ReportIDValidation = z.enum(REPORT_IDS);

export type ReportID = z.infer<typeof ReportIDValidation>;

export const REPORT_NAMES: Record<ReportID, string> = {
  PR: 'Platform Report',
  PR_P1: 'Platform Usage',
  DR: 'Database Master Report',
  DR_D1: 'Database Search and Item Usage',
  DR_D2: 'Database Access Denied',
  TR: 'Title Report',
  TR_B1: 'Book Requests (Excluding OA_Gold)',
  TR_B2: 'Access Denied by Book',
  TR_B3: 'Book Usage by Access Type',
  TR_J1: 'Journal Requests (Excluding OA_Gold)',
  TR_J2: 'Access Denied by Journal',
  TR_J3: 'Journal Usage by Access Type',
  TR_J4: 'Journal Requests by YOP (Excluding OA_Gold)',
  IR: 'Item Report',
  IR_A1: 'Journal Article Requests',
  IR_M1: 'Multimedia Item Requests',
};

export const ReportListItemValidation = z.object({
  Report_Name: z.string(),
  Report_ID: z.string(),
  Report_Description: z.string(),
  Release: z.literal(5),
  Path: z.string().optional(),
});

export type ReportListItem = z.infer<typeof ReportListItemValidation>;

export const ReportPeriodValidation = z.object({
  Begin_Date: z.string().regex(/[0-9]{4}-[0-9]{2}(-[0-9]{2})?/),
  End_Date: z.string().regex(/[0-9]{4}-[0-9]{2}(-[0-9]{2})?/),
});

export type ReportPeriod = z.infer<typeof ReportPeriodValidation>;

export const ReportPeriodQueryValidation = z.object({
  begin_date: ReportPeriodValidation.shape.Begin_Date,
  end_date: ReportPeriodValidation.shape.End_Date,
});

export type ReportQueryPeriod = z.infer<typeof ReportPeriodQueryValidation>;

const ReportInstitutionIDValidation = z.object({
  Type: z.enum(['ISNI', 'ISIL', 'OCLC', 'ROR', 'Proprietary'] as const),
  Value: z.string(),
});

type ReportInstitutionID = z.infer<typeof ReportInstitutionIDValidation>;

export const ItemIDValidation = z.object({
  Type: z.enum(['Online_ISSN', 'Print_ISSN', 'Linking_ISSN', 'ISBN', 'DOI', 'Proprietary', 'URI'] as const),
  Value: z.string(),
});

export type ItemID = z.infer<typeof ItemIDValidation>;

export const PublisherIDValidation = z.object({
  Type: z.enum(['ISNI', 'ROR', 'Proprietary'] as const),
  Value: z.string(),
});

export type PublisherID = z.infer<typeof PublisherIDValidation>;

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
  Report_ID: ReportIDValidation,
  Report_Name: z.string(),
  Release: z.literal('5'),
  Institution_Name: z.string(),
  Institution_ID: z.array(ReportInstitutionIDValidation).optional(),
  Report_Filters: z.array(ReportFilterValidation),
  Report_Attributes: z.array(ReportAttributesValidation).optional(),
  Exceptions: z.array(ExceptionValidation).optional(),
});

export type ReportHeader = z.infer<typeof ReportHeaderValidation>;

const ItemPerformanceInstanceValidation = z.object({
  Metric_Type: z.enum([
    'Searches_Automated',
    'Searches_Federated',
    'Searches_Platform',
    'Searches_Regular',
    'Total_Item_Investigations',
    'Total_Item_Requests',
    'Unique_Item_Investigations',
    'Unique_Item_Requests',
    'Unique_Title_Investigations',
    'Unique_Title_Requests',
    'No_License',
    'Limit_Exceeded',
  ] as const),
  Value: z.number().int().min(1),
});

export const ItemPerformanceValidation = z.object({
  Period: ReportPeriodValidation,
  Instance: z.array(ItemPerformanceInstanceValidation).min(1),
});

export type ItemPerformance = z.infer<typeof ItemPerformanceValidation>;

export const ReportValidation = <T>(ReportItemsValidation: z.ZodSchema<T>) => z.object({
  Report_Header: ReportHeaderValidation,

  Report_Items: z.array(ReportItemsValidation),
});

export type Report<T> = {
  Report_Header: ReportHeader;
  Report_Items: T[];
};

export function createReportHeader(
  Report_ID: ReportID,
  Report_Filters: ReportFilter[],
  Institution_ID?: ReportInstitutionID[],
  Report_Attributes?: ReportAttributes[],
  Exceptions?: Exception[],
): ReportHeader {
  return {
    Created: new Date().toISOString(),
    Created_By: 'Fake Counter Endpoint',
    Report_ID,
    Report_Name: REPORT_NAMES[Report_ID],
    Release: '5',
    Institution_Name: 'test',
    Institution_ID,
    Report_Filters,
    Report_Attributes,
    Exceptions,
  };
}

export function createReport<T>(Report_Header: ReportHeader, Report_Items: T[]) {
  return {
    Report_Header,
    Report_Items,
  };
}
