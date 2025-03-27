import { z } from 'zod';

import { ReportHeaderValidation, type ReportHeader } from '.';

export const PlatformReportValidation = z.object({
  Report_Header: ReportHeaderValidation,

  Report_Items: z.array(z.any()),
});

export type PlatformReport = z.infer<typeof PlatformReportValidation>;

export function createPlatformReport(Report_Header: ReportHeader): PlatformReport {
  return {
    Report_Header,
    Report_Items: [],
  };
}
