import { LoaderFunction } from '@remix-run/server-runtime';
import { z } from 'zod';
import { requireAccountId, requireParameters } from '~api/policy.server';
import { WorkspaceClient } from '~api/workspace/api';

const payloadSchema = z.object({
  name: z.string().min(1).max(100),
  accountType: z.string().max(100).nullable(),
  notes: z.string().max(1024).nullable()
});

export const action: LoaderFunction = async (args) => {
  const { workspaceId, accountId } = requireAccountId(args.params);
  const wsClient = new WorkspaceClient(args);
  const formData = await args.request.formData();
  const payload = payloadSchema.safeParse(Object.fromEntries(formData));

  if (!payload.success) return new Response('Bad Request', { status: 400 });

  const data = payload.data;
  await wsClient.updateAccount(workspaceId, accountId, data.name, data.accountType, data.notes);

  return {};
};
