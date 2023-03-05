import { DataFunctionArgs } from '@remix-run/server-runtime';
import { z } from 'zod';
import { requireWorkspaceId } from '~api/policy.server';
import { WorkspaceClient } from '~api/workspace/api';
import { Button, PageHeader } from '~components';
import StockPortfolioList from '~components/account/stock-portfolio-list';
import { useLoaderDataStrict, useRouteData } from '~hooks';
import { workspaceRouteData } from '../../ws.$workspaceId';

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
  const accounts = await wsClient.getAccountBalances(workspaceId);

  return {
    accounts
  };
};

export default function Accounts() {
  const { accounts } = useLoaderDataStrict(loaderSchema);
  const portfolios = accounts.map((a) => ({
    tradingAccountId: 0,
    settlementAccountId: a.id,
    name: 'Stake',
    settlementAccountName: a.name,
    denomination: a.currency_id,
    value: 31323.13,
    costBase: 11000.1
  }));
  return (
    <div className="w-full self-stretch bg-white dark:bg-stone-800">
      <nav className="flex h-24 items-center justify-between px-4 py-6">
        <PageHeader>Stock Portfolio</PageHeader>
        <Button>New Stock Porfolio</Button>
      </nav>
      <div className="h-[calc(100vh-10rem)] w-full overflow-auto">
        <StockPortfolioList portfolios={portfolios} />
      </div>
    </div>
  );
}
