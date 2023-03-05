import { DataFunctionArgs } from '@remix-run/server-runtime';
import { z } from 'zod';
import { requireWorkspaceId } from '~api/policy.server';
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
  const { newAccount, editAccount } = useModal();
  const fakeAccounts = accounts
    .map((a) => ({
      accountId: a.id,
      name: a.name,
      type: a.type ?? '',
      denomination: a.currency_id,
      precision: currencies.find((c) => c.id === a.currency_id)!.precision
    }))
    .map((a) => ({
      ...a,
      balance:
        ((Math.random() - 0.5) * Math.pow(10, Math.max(a.precision, 6) + 1)) /
        Math.pow(10, a.precision),
      flow: (Math.random() - 0.5) * 10000
    }));

  const handleCreateAccount = () => {
    newAccount(currencies, workspaceId);
  };
  const handleEditAccount = (accountId: number) => {
    const account = accounts.find((a) => a.id === accountId)!;
    editAccount({ ...account, notes: '' }, workspaceId);
  };
  return (
    <div className="w-full self-stretch bg-white dark:bg-stone-800">
      <nav className="flex h-24 items-center justify-between px-4 py-6">
        <PageHeader>Accounts</PageHeader>
        <Button onClick={handleCreateAccount}>New Account</Button>
      </nav>
      <div className="h-[calc(100vh-10rem)] w-full overflow-auto">
        <AccountList accounts={fakeAccounts} onEditAccount={handleEditAccount} />
      </div>
    </div>
  );
}
