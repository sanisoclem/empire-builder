import { z } from 'zod';
export const formSchema = z.object({
  date: z.date(),
  notes: z.string(),
  data: z.array(
    z.union([
      z.object({
        category: z.object({
          id: z.string(),
          accountId: z.number(),
          currency: z.string(),
          name: z.string(),
          category: z.string(),
          type: z.literal('account')
        }),
        amount: z.number(),
        otherAmount: z.number().nullable().optional()
      }),
      z.object({
        category: z.object({
          id: z.string(),
          bucketId: z.number(),
          name: z.string(),
          category: z.string(),
          type: z.literal('bucket')
        }),
        amount: z.number(),
        payee: z.string()
      }),
      z.object({
        category: z.null().optional(),
        amount: z.number()
      })
    ])
  ).nonempty()
});
