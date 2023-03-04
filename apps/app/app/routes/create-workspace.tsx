import { useAuth } from '@clerk/remix';
import { useFetcher, useNavigate, useTransition } from '@remix-run/react';
import { DataFunctionArgs } from '@remix-run/server-runtime';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { ROUTES } from '~/routes';
import { requireAuthenticated } from '~api/auth';
import { getFormDataStrict } from '~api/formData';
import { WorkspaceClient } from '~api/workspace/api';
import { Button, Card, Input, PageHeader } from '~components';

export const action = async (args: DataFunctionArgs) => {
  await requireAuthenticated(args);
  const wsClient = new WorkspaceClient(args);

  const { workspaceName } = await getFormDataStrict(
    args.request,
    z.object({
      workspaceName: z.string()
    })
  );

  const { workspaceId } = await wsClient.createWorkspace(workspaceName);

  return { workspaceId };
};

export default function CreateWorkspace() {
  const [state, setState] = useState<'init' | 'submitting' | 'success' | 'error'>('init');
  const fetcher = useFetcher();
  const auth = useAuth();
  const navigate = useNavigate();
  const transition = useTransition();
  const isLoading = state === 'submitting' || transition.state !== 'idle';

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
          navigate(ROUTES.workspace(fetcher.data.workspaceId).dashboard);
          setState('success');
        }, 2000);
      }
    };
    void sync();
  }, [auth, fetcher.state, navigate, state]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-stone-200 dark:bg-stone-900">
      <div className="w-full max-w-screen-md space-y-4 p-4">
        <PageHeader className="dark:text-white">Create Workspace</PageHeader>
        <p className="text-sm text-stone-500">blah blah blah, margot mabaho ang pepe</p>
        <fetcher.Form
          onSubmit={handleSubmit}
          action={ROUTES.createWorkspace}
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
                Create
              </Button>
            </div>
          </Card>
        </fetcher.Form>
      </div>
    </div>
  );
}
