import { z } from 'zod';

import fakeZodSchema from '~/lib/faker';

const AlertValidation = z.object({
  Date_Time: z.string().datetime().optional(),
  Alert: z.string().optional(),
});

export const StatusValidation = z.object({
  Description: z.string().optional(),
  Service_Active: z.literal(true),
  Registry_URL: z.string().url().startsWith('https://registry.countermetrics.org/platform/').optional(),
  Note: z.string().optional(),
  Alerts: z.array(AlertValidation).optional(),
});

export type Status = z.infer<typeof StatusValidation>;

export function generateFakeStatus(): Promise<Status[]> {
  return fakeZodSchema(z.array(StatusValidation).length(1));
}
