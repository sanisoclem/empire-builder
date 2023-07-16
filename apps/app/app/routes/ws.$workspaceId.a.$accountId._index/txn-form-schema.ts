import { z } from 'zod';

export type Txn = {
  txnId: number;
  date: Date;
  notes: string | null;
  balance: number;
  data: NonEmptyArray<
    | {
        type: 'draft';
        amount: number;
        payee: string;
      }
    | {
        type: 'transfer';
        otherAccountId: number;
        otherAmount: number | null;
        amount: number;
        payee: string;
      }
    | {
        type: 'external';
        bucketId: number;
        amount: number;
        payee: string;
      }
  >;
  meta: Record<string, string | undefined>;
};

export const formSchema = z.object({
  date: z
    .string()
    .transform((v) => new Date(v))
    .pipe(z.date()),
  notes: z.string().max(250),
  data: z
    .array(
      z.union([
        z.object({
          category: z.object({
            id: z.string(),
            accountId: z.number(),
            currency: z.string(),
            name: z.string(),
            category: z.string(),
            precision: z.number(),
            type: z.literal('account')
          }),
          amount: z.string().transform(Number).pipe(z.number()),
          payee: z.string().max(250),
          otherAmount: z
            .string()
            .nullable()
            .optional()
            .transform((c) => (c === null ? null : c === undefined ? undefined : Number(c)))
            .pipe(z.number().optional().nullable())
        }),
        z.object({
          category: z.object({
            id: z.string(),
            bucketId: z.number(),
            name: z.string(),
            category: z.string(),
            type: z.literal('bucket')
          }),
          amount: z.string().transform(Number).pipe(z.number()),
          payee: z.string().max(250)
        }),
        z.object({
          category: z.null().optional(),
          amount: z.string().transform(Number).pipe(z.number()),
          payee: z.string().max(250)
        })
      ])
    )
    .nonempty()
});
