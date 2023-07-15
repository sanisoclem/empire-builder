import { LoaderFunction } from '@remix-run/server-runtime';
import { z } from 'zod';
import { getJsonRequest } from '~api/formData';
import { requireAccountId } from '~api/policy.server';
import { WorkspaceClient } from '~api/workspace/api';

const txnDataSchema = z.union([
  z.object({
    type: z.literal('draft'),
    amount: z.number().int(),
    payee: z.string().max(250)
  }),
  z.object({
    type: z.literal('transfer'),
    otherAccountId: z.number(),
    otherAmount: z.number().int().nullable(),
    amount: z.number().int(),
    payee: z.string().max(250)
  }),
  z.object({
    type: z.literal('external'),
    bucketId: z.number(),
    amount: z.number().int(),
    payee: z.string().max(250)
  })
]);

export const postTxnsPayloadSchema = z
  .object({
    date: z
      .string()
      .transform((d) => new Date(d))
      .pipe(z.date()),
    note: z.string().max(250),
    data: txnDataSchema.array().nonempty(),
    meta: z.record(z.string().max(250).optional())
  })
  .array();

export const action: LoaderFunction = async (args) => {
  const { workspaceId, accountId } = requireAccountId(args.params);
  const wsClient = new WorkspaceClient(args);
  const payload = await getJsonRequest(args, postTxnsPayloadSchema);

  await wsClient.postTransactions(workspaceId, accountId, payload);

  return {};
};
