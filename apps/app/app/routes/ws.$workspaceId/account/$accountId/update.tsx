import { LoaderFunction } from '@remix-run/server-runtime';
import { z } from 'zod';
import { requireParameters } from '~api/policy.server';
import { WorkspaceClient } from '~api/workspace/api';

const payloadSchema = z.object({
  name: z.string().min(1).max(100),
  accountType: z.string().max(100).nullable(),
  notes: z.string().max(1024).nullable()
});

const paramSchema = z.object({
  accountId: z.string(),
  workspaceId: z.string()
});

export const action: LoaderFunction = async (args) => {
  const { workspaceId, accountId } = requireParameters(args.params, paramSchema);
  const wsClient = new WorkspaceClient(args);
  const formData = await args.request.formData();
  const payload = payloadSchema.safeParse(Object.fromEntries(formData));

  if (!payload.success) return new Response('Bad Request', { status: 400 });

  const data = payload.data;
  await wsClient.updateAccount(
    workspaceId,
    parseInt(accountId),
    data.name,
    data.accountType,
    data.notes
  );

  return {};
};
