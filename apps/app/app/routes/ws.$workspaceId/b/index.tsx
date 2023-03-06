import { useNavigate } from '@remix-run/react';
import { DataFunctionArgs } from '@remix-run/server-runtime';
import { z } from 'zod';
import { ROUTES } from '~/routes';
import { requireWorkspaceId } from '~api/policy.server';
import { WorkspaceClient } from '~api/workspace/api';
import { Button, PageHeader } from '~components';
import BudgetList from '~components/account/budget-list';
import { useLoaderDataStrict, useModal, useRouteData } from '~hooks';
import { workspaceRouteData } from '../../ws.$workspaceId';

const loaderSchema = z.object({
  buckets: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
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

export default function Accounts() {
  const { workspaceId } = useRouteData(workspaceRouteData);
  const { buckets } = useLoaderDataStrict(loaderSchema);
  const { newBucket } = useModal();
  const bucketDict = buckets
    .map((b) => ({
      bucketId: b.id,
      name: b.name,
      spent: 0,
      budgeted: 0,
      category: b.category
    }))
    .reduce((acc, b) => {
      if (b.category === null || b.category.trim() === '') {
        return {
          ...acc,
          ['']: [...(acc[''] ?? []), b]
        };
      }
      return {
        ...acc,
        [b.category]: [...(acc[b.category] ?? []), b]
      };
    }, {} as (typeof BudgetList extends (a: infer A) => infer _ ? A : never)['buckets']);

  const handleNewBucket = () => newBucket(workspaceId);
  return (
    <div className="w-full self-stretch bg-white dark:bg-stone-800">
      <nav className="flex h-24 items-center justify-between px-4 py-6">
        <PageHeader>Budget</PageHeader>
        <Button onClick={handleNewBucket}>New Income/Expense</Button>
      </nav>
      <div className="h-[calc(100vh-10rem)] w-full overflow-auto">
        <BudgetList currency="AUD" precision={2} buckets={bucketDict} />
      </div>
    </div>
  );
}
