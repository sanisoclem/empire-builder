import { useLoaderData } from '@remix-run/react';
import { DataFunctionArgs } from '@remix-run/server-runtime';
import { useState } from 'react';
import { requireAccountId, requireWorkspaceId } from '~api/policy.server';
import { WorkspaceClient } from '~api/workspace/api';
import { Button, PageHeader } from '~components';
import TxnList from '~components/account/txn-list';

export const loader = async (args: DataFunctionArgs) => {
  const { workspaceId, accountId } = requireAccountId(args.params);
  const client = new WorkspaceClient(args);
  const currencies = await client.getCurrencies();
  const buckets = await client.getBucketBalances(workspaceId);
  const accounts = await client.getAccountBalances(workspaceId);

  return {
    accountId,
    workspaceId,
    currencies,
    buckets,
    accounts
  };
};

export default function () {
  const { workspaceId, accountId, currencies, ...loadData } =
    useLoaderData<ReturnTypePromise<typeof loader>>();
  const [txns, setTxns] = useState<FirstParam<typeof TxnList>['txns']>([]);
  const [editMode, setEditMode] = useState<
    { editing: true; editedId: number | null } | { editing: false }
  >({ editing: false });
  const account = loadData.accounts.find((a) => a.id === accountId)!;
  const handlePostTransaction = () => {
    setEditMode({
      editing: true,
      editedId: null
    });
  };
  const handleCancel = () => {
    setEditMode({ editing: false });
  };
  return (
    <div className="w-full self-stretch bg-white dark:bg-stone-800">
      <nav className="flex h-24 items-center justify-between px-4 py-6">
        <PageHeader>{account.name}</PageHeader>
        <Button type="button" onClick={handlePostTransaction}>
          Post Transaction
        </Button>
      </nav>
      <div className="h-[calc(100vh-10rem)] w-full overflow-auto">
        <TxnList
          workspaceId={workspaceId}
          accountId={accountId}
          currencies={currencies}
          accounts={loadData.accounts.map((a) => ({ ...a, currency: a.currency_id }))}
          buckets={loadData.buckets}
          txns={txns}
          editMode={editMode.editing}
          editTxnId={editMode.editing ? editMode.editedId : null}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
