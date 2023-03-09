import type { Params } from '@remix-run/react';
import { z } from 'zod';

export const requireWorkspaceId = (params: Params) =>
  requireParameters(params, z.object({ workspaceId: z.string() })).workspaceId;

export const requireAccountId = (params: Params) =>
  requireParameters(
    params,
    z.object({ workspaceId: z.string(), accountId: z.string().transform(Number) })
  );

export const requireParameters = <T extends z.ZodTypeAny>(
  params: Params,
  schema: T
): z.infer<T> => {
  const result = schema.safeParse(params);
  if (!result.success)
    throw new Response('Bad request', {
      status: 400
    });
  return result.data;
};

export const requireSearchParameters = <T extends z.ZodTypeAny>(
  request: Request,
  schema: T
): z.infer<T> => {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams);
  return schema.parse(params);
};
