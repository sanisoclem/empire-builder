import { z } from 'zod';

const configSchema = z.object({
  APP_BASE_URL: z.string().optional(),
  APP_SIGNEDOUT_URL: z.string(),
  VERCEL_ENV: z.string(),
  VERCEL_GIT_COMMIT_REF: z.string(),
  VERCEL_GIT_COMMIT_SHA: z.string(),
  VERCEL_URL: z.string(),
  DATABASE_URL: z.string(),
  CLERK_PUBLISHABLE_KEY: z.string(),
  CLERK_SECRET_KEY: z.string()
});

const getConfig = (ctx: unknown) => {
  const res = configSchema.parse(ctx);

  return {
    version: res.VERCEL_GIT_COMMIT_REF,
    sha: res.VERCEL_GIT_COMMIT_SHA,
    baseUrl: res.APP_BASE_URL ?? `https://${res.VERCEL_URL}`,
    signoutUrl: res.APP_SIGNEDOUT_URL,
    mode: res.VERCEL_ENV,
    isProduction: res.VERCEL_ENV === 'production',
    dbUrl: res.DATABASE_URL,
    clerk: {
      anonKey: res.CLERK_PUBLISHABLE_KEY,
      secretKey: res.CLERK_SECRET_KEY
    }
  } as const;
};

export type AppConfig = ReturnType<typeof getConfig>;
export const CONFIG = getConfig(process.env);
