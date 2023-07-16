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

export const postTxnPayloadSchema = z.object({
  txnId: z.number().optional(),
  date: z
    .string()
    .transform((d) => new Date(d))
    .pipe(z.date()),
  note: z.string().max(250),
  data: z.array(txnDataSchema).nonempty()
});

export const action: LoaderFunction = async (args) => {
  const { workspaceId, accountId } = requireAccountId(args.params);
  const wsClient = new WorkspaceClient(args);
  const payload = await getJsonRequest(args, postTxnPayloadSchema);

  if (payload.txnId === undefined) {
    await wsClient.postTransaction(workspaceId, {
      accountId: accountId,
      ...payload
    });
  } else {
    await wsClient.updateTransaction(workspaceId, payload.txnId, {
      accountId: accountId,
      ...payload
    });
  }

  return {};
};
