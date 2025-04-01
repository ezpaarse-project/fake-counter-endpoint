import { z } from 'zod';

import fakeZodSchema from '~/lib/faker';

import {
  ItemIDValidation,
  ItemPerformanceValidation,
  PublisherIDValidation,
  ReportValidation,
  type ReportItemsGenerator,
} from '.';

const ItemContributorValidation = z.object({
  Type: z.enum(['Author'] as const),
  Name: z.string(),
  Identifier: z.string().optional(),
});

const ItemDateValidation = z.object({
  Type: z.enum(['Publication_Date'] as const),
  Value: z.string().date(),
});

const ItemAttributeValidation = z.object({
  Type: z.enum([
    'Article_Version',
    'Article_Type',
    'Qualification_Name',
    'Qualification_Level',
    'Proprietary',
  ] as const),
  Value: z.string(),
});

const ItemParentValidation = z.object({
  Item_Name: z.string().optional(),
  Item_ID: ItemIDValidation,
  Item_Contributors: z.array(ItemContributorValidation).min(1).optional(),
  Item_Dates: z.array(ItemDateValidation).min(1).optional(),
  Item_Attributes: z.array(ItemAttributeValidation).min(1).optional(),
  Data_Type: z.enum([
    'Book',
    'Dataset',
    'Journal',
    'Multimedia',
    'Newspaper_or_Newsletter',
    'Other',
    'Report',
    'Repository_Item',
    'Thesis_or_Dissertation',
    'Unspecified',
  ] as const).optional(),
});

const ItemComponentValidation = z.object({
  Item_Name: z.string().optional(),
  Item_ID: ItemIDValidation,
  Item_Contributors: z.array(ItemContributorValidation).min(1).optional(),
  Item_Dates: z.array(ItemDateValidation).min(1).optional(),
  Item_Attributes: z.array(ItemAttributeValidation).min(1).optional(),
  Data_Type: z.enum([
    'Article',
    'Book',
    'Book_Segment',
    'Dataset',
    'Journal',
    'Multimedia',
    'Newspaper_or_Newsletter',
    'Other',
    'Report',
    'Repository_Item',
    'Thesis_or_Dissertation',
    'Unspecified',
  ] as const).optional(),
  Performance: z.array(ItemPerformanceValidation).min(1),
});

const ItemUsageValidation = z.object({
  Item: z.string(),
  Item_ID: z.array(ItemIDValidation).min(1).optional(),
  Item_Contributors: z.array(ItemContributorValidation).min(1).optional(),
  Item_Dates: z.array(ItemDateValidation).min(1).optional(),
  Item_Attributes: z.array(ItemAttributeValidation).min(1).optional(),
  Platform: z.string(),
  Publisher: z.string(),
  Publisher_ID: z.array(PublisherIDValidation).min(1).optional(),
  Item_Parent: ItemParentValidation.optional(),
  Item_Component: z.array(ItemComponentValidation).min(1).optional(),
  Data_Type: z.enum([
    'Article',
    'Book',
    'Book_Segment',
    'Dataset',
    'Journal',
    'Multimedia',
    'Newspaper_or_Newsletter',
    'Other',
    'Report',
    'Repository_Item',
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

type ItemUsage = z.infer<typeof ItemUsageValidation>;

export const ItemReportValidation = ReportValidation(ItemUsageValidation);

export type ItemReport = z.infer<typeof ItemReportValidation>;

/**
 * Generate fake item usage
 *
 * @param min Minimum number of items
 *
 * @returns The items
 */
export const generateFakeItemUsage: ReportItemsGenerator<ItemUsage> = (min = 0) => {
  const schema = z.array(ItemUsageValidation).min(min);
  return fakeZodSchema(schema);
};
