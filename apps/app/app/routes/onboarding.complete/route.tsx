import { LoaderFunction } from '@remix-run/server-runtime';
import { z } from 'zod';
import { CLERK_PROVIDER_TYPE, requireAuthenticated } from '~api/auth';
import { WorkspaceClient } from '~api/workspace/api';

const payloadSchema = z.object({
  workspaceName: z.string().max(50)
});
export const action: LoaderFunction = async (args) => {
  const wsClient = new WorkspaceClient(args);
  const { customClaims, userId } = await requireAuthenticated(args);
  const formData = await args.request.formData();
  const payload = payloadSchema.safeParse(Object.fromEntries(formData));

  if ('appUserId' in customClaims)
    return new Response('Bad Request, already onboarded', { status: 400 });
  if (!payload.success) return new Response('Bad Request', { status: 400 });

  return await wsClient.onboard({
    providerType: CLERK_PROVIDER_TYPE,
    userId: userId,
    workspaceName: payload.data.workspaceName
  });
  // TODO: create accounts
  // TODO: save probing question answers
};
