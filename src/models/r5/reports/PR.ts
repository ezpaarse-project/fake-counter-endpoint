import { z } from 'zod';

import {
  ReportHeaderValidation,
  type ReportHeader,
} from '.';
import fakeZodSchema from '~/lib/faker';

const ItemPerformanceValidation = z.object({
  Period: z.object({
    Begin_Date: z.string().regex(/[0-9]{4}-[0-9]{2}(-[0-9]{2})?/),
    End_Date: z.string().regex(/[0-9]{4}-[0-9]{2}(-[0-9]{2})?/),
  }),
  Instance: z.array(z.object({
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
  })).min(1),
});

const PlatformUsageValidation = z.object({
  Platform: z.string(),
  Data_Type: z.enum([
    'Article',
    'Book',
    'Book_Segment',
    'Database',
    'Dataset',
    'Journal',
    'Multimedia',
    'Newspaper_or_Newsletter',
    'Other',
    'Platform',
    'Report',
    'Repository_Item',
    'Thesis_or_Dissertation',
    'Unspecified',
  ] as const).optional(),
  Access_Method: z.enum(['Regular', 'TDM'] as const).optional(),
  Performance: z.array(ItemPerformanceValidation).min(1),
});

type PlatformUsage = z.infer<typeof PlatformUsageValidation>;

export const PlatformReportValidation = z.object({
  Report_Header: ReportHeaderValidation,

  Report_Items: z.array(PlatformUsageValidation),
});

export type PlatformReport = z.infer<typeof PlatformReportValidation>;

export function generateFakePerformances(min = 0): Promise<PlatformUsage[]> {
  return fakeZodSchema(z.array(PlatformUsageValidation).min(min));
}

export function createPlatformReport(
  Report_Header: ReportHeader,
  Report_Items: PlatformUsage[],
): PlatformReport {
  return {
    Report_Header,
    Report_Items,
  };
}
