import { useAuth } from '@clerk/remix';
import { useFetcher, useNavigate, useNavigation } from '@remix-run/react';
import { DataFunctionArgs, redirect } from '@remix-run/server-runtime';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { ROUTES } from '~/routes';
import { requireAuthenticated } from '~api/auth';
import { Button, Card, Input, PageHeader } from '~components';
import { useLoaderDataStrict } from '~hooks';

const loaderSchema = z.union([
  z.literal('init'),
  z.literal('submitting'),
  z.literal('error'),
  z.literal('success')
]);

export const loader = async (args: DataFunctionArgs): Promise<z.infer<typeof loaderSchema>> => {
  const { customClaims } = await requireAuthenticated(args);

  if ('appUserId' in customClaims) {
    throw redirect(ROUTES.home);
  }

  // TODO: fetch onboarding state (if any)

  return 'init';
};

export default function GetStarted() {
  const loadedOnboardingState = useLoaderDataStrict(loaderSchema);
  const [state, setState] = useState<z.infer<typeof loaderSchema>>(loadedOnboardingState);
  const fetcher = useFetcher();
  const auth = useAuth();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isLoading = state === 'submitting' || navigation.state !== 'idle';

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (state !== 'init') {
      e.preventDefault();
      return;
    }

    setState('submitting');
  };

  useEffect(() => {
    const sync = async () => {
      if (state === 'submitting' && fetcher.state === 'idle') {
        const updatedToken = await auth.getToken({ skipCache: true });
        if (updatedToken === null) throw new Error('Failed to refresh token');
        setTimeout(() => {
          navigate(ROUTES.home);
          setState('success');
        }, 2000);
      }
    };
    void sync();
  }, [auth, fetcher.state, navigate, state]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-stone-300">
      <div className="w-full max-w-screen-md space-y-4 p-4">
        <PageHeader>Setup your account</PageHeader>
        <p className="text-sm text-stone-500">
          sub text should go here to explain why we need to setup
        </p>
        <fetcher.Form
          onSubmit={handleSubmit}
          action={ROUTES.onboarding.complete}
          method="post"
          className="flex w-full items-center justify-center"
        >
          <Card className="w-full space-y-4 p-6">
            <div className="space-y-4">
              <Input
                label="Name your workspace"
                name="workspaceName"
                maxLength={50}
                type="text"
                disabled={isLoading}
                placeholder="e.g., Joe's Workspace"
                className=""
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="submit" className="inline-block" isLoading={isLoading}>
                Complete Setup
              </Button>
            </div>
          </Card>
        </fetcher.Form>
      </div>
    </div>
  );
}
