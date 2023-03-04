import { z } from 'zod';

const configSchema = z.object({
  APP_ENV: z.string(),
  APP_BASE_URL: z.string().optional(),
  APP_SIGNEDOUT_URL: z.string(),
  CF_PAGES_COMMIT_SHA: z.string(),
  CF_PAGES_URL: z.string(),
  DATABASE_URL: z.string()
});

export const getConfig = (ctx: unknown) => {
  const res = configSchema.parse(ctx);

  return {
    version: res.CF_PAGES_COMMIT_SHA,
    baseUrl: res.APP_BASE_URL ?? res.CF_PAGES_URL,
    signoutUrl: res.APP_SIGNEDOUT_URL,
    mode: res.APP_ENV,
    isProduction: res.APP_ENV === 'production',
    dbUrl: res.DATABASE_URL
  } as const;
};

export type AppConfig = ReturnType<typeof getConfig>;
