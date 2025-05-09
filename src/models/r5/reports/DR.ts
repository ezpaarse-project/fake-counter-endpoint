import { z } from 'zod';

import fakeZodSchema from '~/lib/faker';

import {
  ItemIDValidation,
  ItemPerformanceValidation,
  PublisherIDValidation,
  ReportValidation,
  type ReportItemsGenerator,
} from '.';

const DatabaseUsageValidation = z.object({
  Database: z.string(),
  Item_ID: z.array(ItemIDValidation).min(1).optional(),
  Platform: z.string(),
  Publisher: z.string(),
  Publisher_ID: z.array(PublisherIDValidation).min(1).optional(),
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

/**
 * Generate fake database usage
 *
 * @param min Minimum number of items
 *
 * @returns The items
 */
export const generateFakeDatabaseUsage: ReportItemsGenerator<DatabaseUsage> = (min = 0) => {
  const schema = z.array(DatabaseUsageValidation).min(min);
  return fakeZodSchema(schema);
};
