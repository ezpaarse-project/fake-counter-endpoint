import { z } from 'zod';

export const ReportItemValidation = z.object({
  Report_Name: z.string(),
  Report_ID: z.string(),
  Release: z.literal(5),
  Report_Description: z.string(),
  Path: z.string().optional(),
});

export type ReportItem = z.infer<typeof ReportItemValidation>;
