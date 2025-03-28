import { z } from 'zod';

import fakeZodSchema from '~/lib/faker';

import { ItemPerformanceValidation, ReportValidation, type ReportItemsGenerator } from '.';

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

export const PlatformReportValidation = ReportValidation(PlatformUsageValidation);

export type PlatformReport = z.infer<typeof PlatformReportValidation>;

export const generateFakePlatformUsage: ReportItemsGenerator<PlatformUsage> = (min = 0) => {
  const schema = z.array(PlatformUsageValidation).min(min);
  return fakeZodSchema(schema);
};
