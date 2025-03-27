import { z } from 'zod';

export const AuthValidation = z.object({
  customer_id: z.string(),
  requestor_id: z.string().optional(),
  api_key: z.string().optional(),
});

export type Auth = z.infer<typeof AuthValidation>;
