import { useFetcher, useLoaderData, useRouteLoaderData } from '@remix-run/react';
import { DataFunctionArgs } from '@remix-run/server-runtime';
import { useState } from 'react';
import { ROUTES } from '~/routes';
import { submitJsonRequest } from '~api/formData';
import { requireAccountId, requireWorkspaceId } from '~api/policy.server';
import { WorkspaceClient } from '~api/workspace/api';
import { Button, PageHeader } from '~components';
import TxnList from '~components/account/txn-list';
import { postTxnPayloadSchema } from './post-txn';

export const loader = async (args: DataFunctionArgs) => {
  const { workspaceId, accountId } = requireAccountId(args.params);
  const client = new WorkspaceClient(args);
  const currencies = await client.getCurrencies();
  const buckets = await client.getBucketBalances(workspaceId);
  const [accounts, balances] = await client.getAccountBalances(workspaceId);
  const txns = await client.getTransactions(workspaceId, accountId);

  return {
    accountId,
    workspaceId,
    currencies,
    buckets,
    accounts,
    txns
  };
};

export default function () {
  const { workspaceId, accountId, currencies, ...loadData } =
    useLoaderData<ReturnTypePromise<typeof loader>>();
  const fetcher = useFetcher();
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
  const mapNonEmpty = <T extends unknown, U>(
    [v, ...vs]: NonEmptyArray<T>,
    fn: (a: T) => U
  ): NonEmptyArray<U> => [fn(v), ...vs.map(fn)];

  const handleEdit = (t: FirstParam<FirstParam<typeof TxnList>['onRowEdit']>) => {
    setEditMode({
      editedId: t.txnId,
      editing: true
    });
  };

  const handleSaveTxn = (t: FirstParam<FirstParam<typeof TxnList>['onSubmit']>) => {
    submitJsonRequest(
      fetcher,
      ROUTES.workspace(workspaceId).account.item(accountId.toString()).postTransaction,
      postTxnPayloadSchema,
      {
        note: t.notes,
        date: t.date.toISOString(),
        data: mapNonEmpty(t.data, (d) => {
          return {
            amount: d.amount,
            ...(d.category?.type === 'bucket' && 'payee' in d
              ? { type: 'external' as const, bucketId: d.category.bucketId, payee: d.payee }
              : d.category?.type === 'account' && 'otherAmount' in d
              ? {
                  type: 'transfer' as const,
                  otherAccountId: d.category.accountId,
                  otherAmount: d.otherAmount ?? null
                }
              : { type: 'draft' as const })
          };
        })
      }
    );
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
          onSubmit={handleSaveTxn}
          workspaceId={workspaceId}
          accountId={accountId}
          currencies={currencies}
          accounts={loadData.accounts.map((a) => ({ ...a, currency: a.currency_id }))}
          buckets={loadData.buckets}
          txns={loadData.txns.map((t) => ({
            txnId: t.id,
            date: new Date(t.date),
            notes: t.notes,
            data: t.data
          }))}
          editMode={editMode.editing}
          editTxnId={editMode.editing ? editMode.editedId : null}
          onCancel={handleCancel}
          onRowEdit={handleEdit}
        />
      </div>
    </div>
  );
}
