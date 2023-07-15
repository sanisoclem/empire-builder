import { DataFunctionArgs } from '@remix-run/server-runtime';
import { z } from 'zod';
import { requireWorkspaceId } from '~api/policy.server';
import { WorkspaceClient } from '~api/workspace/api';
import { Button, ClientOnly, Loader, PageHeader } from '~components';
import BudgetList from '~components/account/budget-list';
import { useLoaderDataStrict, useModal, useRouteData } from '~hooks';
import { workspaceRouteData } from './ws.$workspaceId';

const loaderSchema = z.object({
  buckets: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      order: z.number().nullable(),
      category: z.string().nullable()
    })
  )
});

export const loader = async (args: DataFunctionArgs): Promise<z.infer<typeof loaderSchema>> => {
  const wsClient = new WorkspaceClient(args);
  const workspaceId = requireWorkspaceId(args.params);
  const buckets = await wsClient.getBucketBalances(workspaceId);

  return {
    buckets
  };
};

export default function Budget() {
  const { workspaceId } = useRouteData(workspaceRouteData);
  const { buckets } = useLoaderDataStrict(loaderSchema);
  const { newBucket } = useModal();
  const mappedBuckets = buckets.map((b) => ({
    bucketId: b.id,
    name: b.name,
    spent: 0,
    budgeted: 0,
    category: b.category ?? '',
    index: b.order ?? 0
  }));

  const handleNewBucket = () => newBucket(workspaceId);
  return (
    <div className="w-full self-stretch bg-white dark:bg-stone-900">
      <nav className="flex h-24 items-center justify-between px-4 py-6">
        <PageHeader>Budget</PageHeader>
        <Button onClick={handleNewBucket}>New Income/Expense</Button>
      </nav>
      <div className="h-[calc(100vh-10rem)] w-full overflow-auto">
        <ClientOnly
          fallback={
            <div className="flex h-full w-full items-center justify-center">
              <Loader />
            </div>
          }
        >
          {() => (
            <BudgetList
              workspaceId={workspaceId}
              currency="AUD"
              precision={2}
              buckets={mappedBuckets}
            />
          )}
        </ClientOnly>
      </div>
    </div>
  );
}
