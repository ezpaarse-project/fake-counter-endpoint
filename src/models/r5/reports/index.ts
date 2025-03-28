import { z } from 'zod';
import { faker } from '@faker-js/faker';

import { ExceptionValidation, type Exception } from '../exceptions';
import { InstitutionIDValidation, type InstitutionID } from '../institutions';

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

export const isReportId = (id: string): id is ReportID => (
  REPORT_IDS as Readonly<string[]>
).includes(id);

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
  Begin_Date: z.string().date(),
  End_Date: z.string().date(),
});

export type ReportPeriod = z.infer<typeof ReportPeriodValidation>;

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

export const ReportFilterValidation = z.object({
  Name: z.string(),
  Value: z.string(),
});

export type ReportFilter = z.infer<typeof ReportFilterValidation>;

export const ReportAttributeValidation = z.object({
  Name: z.string(),
  Value: z.string(),
});

export type ReportAttribute = z.infer<typeof ReportAttributeValidation>;

export const ReportHeaderValidation = z.object({
  Created: z.string().datetime(),
  Created_By: z.string(),
  Customer_ID: z.string().optional(),
  Report_ID: ReportIDValidation,
  Report_Name: z.string(),
  Release: z.literal('5'),
  Institution_Name: z.string(),
  Institution_ID: z.array(InstitutionIDValidation).optional(),
  Report_Filters: z.array(ReportFilterValidation),
  Report_Attributes: z.array(ReportAttributeValidation).optional(),
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

export async function createReportHeader(
  Report_ID: ReportID,
  Report_Filters: ReportFilter[],
  Report_Attributes?: ReportAttribute[],
  Exceptions?: Exception[],
): Promise<ReportHeader> {
  const institutionIdLength = Math.random() * 3;
  const institutionIds: InstitutionID[] = Array.from({ length: institutionIdLength }, () => ({
    Type: faker.helpers.arrayElement(Object.values(InstitutionIDValidation.shape.Type.Values)),
    Value: faker.string.alpha(5 + Math.random() * 10),
  }));

  return {
    Created: new Date().toISOString(),
    Created_By: 'Fake Counter Endpoint',
    Report_ID,
    Report_Name: REPORT_NAMES[Report_ID],
    Release: '5',
    Institution_Name: faker.company.name(),
    Institution_ID: institutionIds,
    Report_Filters,
    Report_Attributes,
    Exceptions,
  };
}

export type ReportItemsGenerator<T> = (min?: number) => Promise<T[]>;

export function createReport<T>(Report_Header: ReportHeader, Report_Items: T[]) {
  return {
    Report_Header,
    Report_Items,
  };
}
