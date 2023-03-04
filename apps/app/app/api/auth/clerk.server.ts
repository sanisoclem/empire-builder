import { createClerkClient } from '@clerk/remix/api.server';
import { getAuth as clerkGetAuth } from '@clerk/remix/ssr.server';
import { DataFunctionArgs, redirect } from '@remix-run/server-runtime';
import { z } from 'zod';
import { CONFIG } from '~/config.server';
import { ROUTES } from '~/routes';

export const CLERK_PROVIDER_TYPE = 'CLERK';

const customClaims = z.union([
  // order is important
  z.object({
    appUserId: z.string(),
    workspaces: z.array(z.string())
  }),
  z.object({})
]);

export const getAuth = async (args: DataFunctionArgs) => {
  const v = await clerkGetAuth(args);
  if (!v.userId) throw redirect(ROUTES.signin);
  const decoded = customClaims.parse(v.sessionClaims);

  return {
    ...v,
    customClaims: decoded
  };
};

export const requireAuthenticated = async (args: DataFunctionArgs) => {
  const { userId, ...auth } = await getAuth(args);

  if (!userId) {
    throw redirect(ROUTES.signin);
  }
  return { ...auth, userId };
};

export const requireOnboarded = async (args: DataFunctionArgs) => {
  const { userId, customClaims, ...auth } = await getAuth(args);

  if (!userId) {
    throw redirect(ROUTES.signin);
  }
  if (!('appUserId' in customClaims)) {
    throw redirect(ROUTES.onboarding.start);
  }

  return {
    ...auth,
    userId,
    customClaims
  };
};

export class AuthClient {
  private client: ReturnType<typeof createClerkClient>;
  constructor(private args: DataFunctionArgs) {
    this.client = createClerkClient({
      apiKey: CONFIG.clerk.secretKey
    });
  }

  async updateUserPublicMetadata(userId: string, metadata: z.infer<typeof customClaims>) {
    return await this.client.users.updateUserMetadata(userId, {
      publicMetadata: metadata
    });
  }
  async getUser(userId: string) {
    return await this.client.users.getUser(userId);
  }
}
