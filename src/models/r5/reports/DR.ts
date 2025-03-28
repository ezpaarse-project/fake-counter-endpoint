import { z } from 'zod';

import fakeZodSchema from '~/lib/faker';

import {
  ItemIDValidation,
  ItemPerformanceValidation,
  PublisherIDValidation,
  ReportValidation,
} from '.';

const DatabaseUsageValidation = z.object({
  Database: z.string(),
  Item_ID: ItemIDValidation.optional(),
  Platform: z.string(),
  Publisher: z.string(),
  Publisher_ID: PublisherIDValidation.optional(),
  Data_Type: z.enum([
    'Book',
    'Database',
    'Journal',
    'Multimedia',
    'Newspaper_or_Newsletter',
    'Other',
    'Report',
    'Thesis_or_Dissertation',
    'Unspecified',
  ] as const).optional(),
  Access_Method: z.enum(['Regular', 'TDM'] as const).optional(),
  Performance: z.array(ItemPerformanceValidation).min(1),
});

type DatabaseUsage = z.infer<typeof DatabaseUsageValidation>;

export const DatabaseReportValidation = ReportValidation(DatabaseUsageValidation);

export type DatabaseReport = z.infer<typeof DatabaseReportValidation>;

export function generateFakeDatabaseUsage(min = 0): Promise<DatabaseUsage[]> {
  return fakeZodSchema(z.array(DatabaseUsageValidation).min(min));
}
