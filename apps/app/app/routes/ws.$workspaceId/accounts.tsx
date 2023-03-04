import { DataFunctionArgs } from '@remix-run/server-runtime';
import { z } from 'zod';
import { requireParameters, requireWorkspaceId } from '~api/policy.server';
import { WorkspaceClient } from '~api/workspace/api';
import { Button, PageHeader } from '~components';
import AccountList from '~components/account/account-list';
import { useLoaderDataStrict, useModal, useRouteData } from '~hooks';
import { workspaceRouteData } from '../ws.$workspaceId';

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
  const { currencies, workspaceId } = useRouteData(workspaceRouteData);
  const { accounts } = useLoaderDataStrict(loaderSchema);
  const { newAccount } = useModal();
  const fakeAccounts = accounts.map((a) => ({
    accountId: a.id,
    name: a.name,
    type: a.type ?? '',
    denomination: a.currency_id,
    balance: 0,
    flow: 0
  }));

  const handleCreateAccount = () => {
    newAccount(currencies, workspaceId);
  };
  return (
    <div className="w-full self-stretch bg-white dark:bg-stone-800">
      <nav className="flex items-center justify-between px-4 py-6">
        <PageHeader>Accounts</PageHeader>
        <Button onClick={handleCreateAccount}>New Account</Button>
      </nav>
      <div className="w-full overflow-x-auto">
        <div className="overflow-hidden shadow">
          <AccountList accounts={fakeAccounts} />
        </div>
      </div>
    </div>
  );
}
