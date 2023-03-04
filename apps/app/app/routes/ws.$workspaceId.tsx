import { Transition } from '@headlessui/react';
import { Outlet, useTransition } from '@remix-run/react';
import { DataFunctionArgs, LoaderFunction, redirect } from '@remix-run/server-runtime';
import { z } from 'zod';
import { CONFIG } from '~/config.server';
import { ROUTES, ROUTE_DEFS } from '~/routes';
import { AuthClient, requireOnboarded } from '~api/auth';
import { requireWorkspaceId } from '~api/policy.server';
import { WorkspaceClient } from '~api/workspace/api';
import { Sidebar, Topbar } from '~components';
import { makeRouteData, useLoaderDataStrict } from '~hooks';

const loaderSchema = z.object({
  avatar: z.string(),
  displayName: z.string(),
  mode: z.string(),
  version: z.string(),
  sha: z.string(),
  workspaceId: z.string(),
  workspaces: z.array(z.object({ id: z.string(), name: z.string() })),
  currencies: z.array(z.object({ id: z.string(), name: z.string(), precision: z.number() }))
});

export const loader = async (args: DataFunctionArgs): Promise<z.infer<typeof loaderSchema>> => {
  const { userId } = await requireOnboarded(args);
  const authClient = new AuthClient(args);
  const wsClient = new WorkspaceClient(args);
  const user = await authClient.getUser(userId);
  const workspaceId = requireWorkspaceId(args.params);

  const wsInfo = await wsClient.getWorkspaceInfo(workspaceId);
  const workspaces = await wsClient.getAllWorkspaces();
  const currencies = await wsClient.getCurrencies();

  if (wsInfo === null) throw redirect(ROUTES.home);

  return {
    avatar: user.profileImageUrl,
    displayName: user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)!.emailAddress,
    mode: CONFIG.mode,
    version: CONFIG.version,
    sha: CONFIG.sha,
    workspaceId,
    workspaces,
    currencies
  };
};

export const workspaceRouteData = makeRouteData(ROUTE_DEFS.workspace, loaderSchema);

export default function LedgerLayout() {
  const transition = useTransition();
  const { workspaceId, workspaces, mode, version, ...user } = useLoaderDataStrict(loaderSchema);

  return (
    <>
      <div className="flex h-screen w-screen items-stretch">
        <Sidebar workspaceId={workspaceId} className="flex-none" version={version} />
        <div className="flex flex-1 flex-col items-stretch bg-stone-200 transition-colors dark:bg-stone-900 dark:text-white">
          <Topbar user={user} mode={mode} className="flex-none shadow" workspaces={workspaces} />
          {/* <BreadcrumsBar breadcrumbs={bc} className="" /> */}
          <div className="relative flex-1 overflow-y-auto">
            <Transition
              show={transition.state === 'loading'}
              unmount={true}
              className="pointer-events-none absolute top-0 left-0 flex h-[calc(100vh-4rem)] w-full items-center justify-center"
              enter="transition-opacity duration-150 delay-500"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <svg
                className="-ml-1 mr-3 h-5 w-5 animate-spin text-stone-900"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </Transition>
            <Transition
              show={transition.state !== 'loading'}
              enter="transition-opacity duration-150 delay-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
                <Outlet />
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </>
  );
}
