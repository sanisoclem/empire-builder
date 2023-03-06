import { LoaderFunction } from '@remix-run/server-runtime';
import { z } from 'zod';
import { requireParameters } from '~api/policy.server';
import { WorkspaceClient } from '~api/workspace/api';

const payloadSchema = z
  .object({
    bucketId: z.number(),
    order: z.number(),
    category: z.string().max(100).nullable()
  })
  .array();

const paramSchema = z.object({
  workspaceId: z.string()
});

export const action: LoaderFunction = async (args) => {
  const { workspaceId } = requireParameters(args.params, paramSchema);
  const wsClient = new WorkspaceClient(args);
  const formData = await args.request.formData();
  const raw = formData.get('request');

  if (typeof raw !== 'string') return new Response('Bad Request', { status: 400 });

  const payload = payloadSchema.safeParse(JSON.parse(raw));

  if (!payload.success) return new Response('Bad Request', { status: 400 });

  await wsClient.organizeBuckets(
    workspaceId,
    payload.data.map((b) => ({ id: b.bucketId, ...b }))
  );

  return {};
};
