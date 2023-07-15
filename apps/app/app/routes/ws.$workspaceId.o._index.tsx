import { DataFunctionArgs } from '@remix-run/server-runtime';
import { z } from 'zod';
import { requireWorkspaceId } from '~api/policy.server';
import { WorkspaceClient } from '~api/workspace/api';
import { Button, PageHeader } from '~components';
import OtherAssetList from '~components/account/other-asset-list';
import { useRouteData } from '~hooks';
import { workspaceRouteData } from './ws.$workspaceId';

const loaderSchema = z.object({
  accounts: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      currency_id: z.string(),
      type: z.string().nullable()
    })
  )
});

export const loader = async (args: DataFunctionArgs): Promise<z.infer<typeof loaderSchema>> => {
  const wsClient = new WorkspaceClient(args);
  const workspaceId = requireWorkspaceId(args.params);
  const [accounts, _] = await wsClient.getAccountBalances(workspaceId);

  return {
    accounts
  };
};

export default function Accounts() {
  const { currencies } = useRouteData(workspaceRouteData);
  const assets = [
    {
      assetId: 0,
      name: 'Honda Civic 2019',
      assetType: 'Car',
      costBase: 27000,
      value: 15000,
      currency: currencies[0].id
    }
  ];

  return (
    <div className="w-full self-stretch bg-white dark:bg-stone-800">
      <nav className="flex h-24 items-center justify-between px-4 py-6">
        <PageHeader>Other Assets</PageHeader>
        <Button>New Asset</Button>
      </nav>
      <div className="h-[calc(100vh-10rem)] w-full overflow-auto">
        <OtherAssetList assets={assets} />
      </div>
    </div>
  );
}
