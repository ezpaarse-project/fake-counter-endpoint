import { z } from 'zod';

import fakeZodSchema from '~/lib/faker';

export const InstitutionIDValidation = z.object({
  Type: z.enum(['ISNI', 'ISIL', 'OCLC', 'ROR', 'Proprietary'] as const),
  Value: z.string(),
});

export type InstitutionID = z.infer<typeof InstitutionIDValidation>;

export const InstitutionValidation = z.object({
  Customer_ID: z.string(),
  Requestor_ID: z.string().optional(),
  Name: z.string(),
  Notes: z.string().optional(),
  Institution_ID: z.array(InstitutionIDValidation).optional(),
});

export type Institution = z.infer<typeof InstitutionValidation>;

export function generateFakeInstitutions(): Promise<Institution[]> {
  return fakeZodSchema(z.array(InstitutionValidation));
}
