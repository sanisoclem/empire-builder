import { useLoaderData } from '@remix-run/react';
import { DataFunctionArgs } from '@remix-run/server-runtime';
import { useState } from 'react';
import { z } from 'zod';
import { genCompressedId } from '~api/id';
import { requireAccountId, requireWorkspaceId } from '~api/policy.server';
import { WorkspaceClient } from '~api/workspace/api';
import { Button, PageHeader } from '~components';
import TxnList from '~components/account/txn-list';
import { useLoaderDataStrict } from '~hooks';

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
  const [editing, setEditing] = useState<FirstParam<typeof TxnList>['editing']>(undefined);
  const account = loadData.accounts.find((a) => a.id === accountId)!;
  const handlePostTransaction = () => {
    setEditing({
      txnId: null,
      date: new Date(),
      notes: '',
      data: [
        {
          type: 'draft',
          amount: 0
        }
      ]
    });
  };
  return (
    <div className="w-full self-stretch bg-white dark:bg-stone-800">
      <nav className="flex h-24 items-center justify-between px-4 py-6">
        <PageHeader>{account.name}</PageHeader>
        <Button onClick={handlePostTransaction}>Post Transaction</Button>
      </nav>
      <div className="h-[calc(100vh-10rem)] w-full overflow-auto">
        <TxnList
          workspaceId={workspaceId}
          accountId={accountId}
          currencies={currencies}
          accounts={loadData.accounts.map((a) => ({ ...a, currency: a.currency_id }))}
          buckets={loadData.buckets}
          txns={txns}
          editing={editing}
        />
      </div>
    </div>
  );
}
