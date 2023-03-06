import { LoaderFunction } from '@remix-run/server-runtime';
import { z } from 'zod';
import { requireParameters } from '~api/policy.server';
import { WorkspaceClient } from '~api/workspace/api';

const payloadSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().max(100).nullable(),
});

const paramSchema = z.object({
  workspaceId: z.string()
});

export const action: LoaderFunction = async (args) => {
  const { workspaceId } = requireParameters(args.params, paramSchema);
  const wsClient = new WorkspaceClient(args);
  const formData = await args.request.formData();
  const payload = payloadSchema.safeParse(Object.fromEntries(formData));

  if (!payload.success) return new Response('Bad Request', { status: 400 });

  const data = payload.data;
  return await wsClient.createBucket(
    workspaceId,
    data.name,
    data.category,
  );
};
