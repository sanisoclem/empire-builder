import { useLoaderData, useNavigate } from '@remix-run/react';
import { DataFunctionArgs } from '@remix-run/server-runtime';
import { z } from 'zod';
import { ROUTES } from '~/routes';
import { requireWorkspaceId } from '~api/policy.server';
import { WorkspaceClient } from '~api/workspace/api';
import { Button, PageHeader } from '~components';
import AccountList from '~components/account/account-list';
import { useModal, useRouteData } from '~hooks';
import { workspaceRouteData } from './ws.$workspaceId';

export const loader = async (args: DataFunctionArgs) => {
  const wsClient = new WorkspaceClient(args);
  const workspaceId = requireWorkspaceId(args.params);
  const [accounts, balances] = await wsClient.getAccountBalances(workspaceId);

  return {
    accounts: accounts.map((a) => ({
      ...a,
      balance: balances[a.currency_id]?.accounts[a.id.toString()] ?? 0
    }))
  };
};

export default function Accounts() {
  const { currencies, workspaceId } = useRouteData(workspaceRouteData);
  const { accounts } = useLoaderData<ReturnTypePromise<typeof loader>>();
  const { newAccount, editAccount } = useModal();
  const navigate = useNavigate();
  const fakeAccounts = accounts
    .map((a) => ({
      accountId: a.id,
      name: a.name,
      type: a.type ?? '',
      denomination: a.currency_id,
      balance: a.balance,
      precision: currencies.find((c) => c.id === a.currency_id)!.precision
    }))
    .map((a) => ({
      ...a,
      flow: 0
    }));

  const handleCreateAccount = () => {
    newAccount(currencies, workspaceId);
  };
  const handleEditAccount = (accountId: number) => {
    const account = accounts.find((a) => a.id === accountId)!;
    editAccount({ ...account, notes: '' }, workspaceId);
  };
  const handleViewTransactions = (accountId: number) => {
    navigate(ROUTES.workspace(workspaceId).account.item(accountId.toString()).transactions);
  };
  return (
    <div className="w-full self-stretch bg-white dark:bg-stone-800">
      <nav className="flex h-24 items-center justify-between px-4 py-6">
        <PageHeader>Accounts</PageHeader>
        <Button onClick={handleCreateAccount}>New Account</Button>
      </nav>
      <div className="h-[calc(100vh-10rem)] w-full overflow-auto">
        <AccountList
          accounts={fakeAccounts}
          onViewTransactions={handleViewTransactions}
          onEditAccount={handleEditAccount}
        />
      </div>
    </div>
  );
}
