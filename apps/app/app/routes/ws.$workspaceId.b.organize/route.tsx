import { LoaderFunction } from '@remix-run/server-runtime';
import { z } from 'zod';
import { getJsonRequest } from '~api/formData';
import { requireWorkspaceId } from '~api/policy.server';
import { WorkspaceClient } from '~api/workspace/api';

export const organizeBudgetPayloadSchema = z
  .object({
    bucketId: z.number(),
    order: z.number(),
    category: z.string().max(100).nullable()
  })
  .array();

export const action: LoaderFunction = async (args) => {
  const workspaceId = requireWorkspaceId(args.params);
  const wsClient = new WorkspaceClient(args);

  const payload = await getJsonRequest(args, organizeBudgetPayloadSchema);

  await wsClient.organizeBuckets(
    workspaceId,
    payload.map((b) => ({ id: b.bucketId, ...b }))
  );

  return {};
};
