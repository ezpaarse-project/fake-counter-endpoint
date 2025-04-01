import { z } from 'zod';

import fakeZodSchema from '~/lib/faker';

import {
  ItemIDValidation,
  ItemPerformanceValidation,
  PublisherIDValidation,
  ReportValidation,
  type ReportItemsGenerator,
} from '.';

const TitleUsageValidation = z.object({
  Title: z.string(),
  Item_ID: z.array(ItemIDValidation).min(1).optional(),
  Platform: z.string(),
  Publisher: z.string(),
  Publisher_ID: z.array(PublisherIDValidation).min(1).optional(),
  Data_Type: z.enum([
    'Book',
    'Database',
    'Journal',
    'Newspaper_or_Newsletter',
    'Other',
    'Report',
    'Thesis_or_Dissertation',
    'Unspecified',
  ] as const).optional(),
  Section_Type: z.enum([
    'Article',
    'Book',
    'Chapter',
    'Other',
    'Section',
  ] as const).optional(),
  YOP: z.string().regex(/[0-9]{4}/).optional(),
  Access_Type: z.enum(['Controlled', 'OA_Gold', 'Other_Free_To_Read'] as const).optional(),
  Access_Method: z.string().optional(),
  Performance: z.array(ItemPerformanceValidation).min(1),
});

type TitleUsage = z.infer<typeof TitleUsageValidation>;

export const TitleReportValidation = ReportValidation(TitleUsageValidation);

export type TitleReport = z.infer<typeof TitleReportValidation>;

/**
 * Generate fake title usage
 *
 * @param min Minimum number of items
 *
 * @returns The items
 */
export const generateFakeTitleUsage: ReportItemsGenerator<TitleUsage> = (min = 0) => {
  const schema = z.array(TitleUsageValidation).min(min);
  return fakeZodSchema(schema);
};
