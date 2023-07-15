import { useFetcher, useLoaderData } from '@remix-run/react';
import { DataFunctionArgs } from '@remix-run/server-runtime';
import { useEffect, useState } from 'react';
import { ROUTES } from '~/routes';
import { submitJsonRequest } from '~api/formData';
import { requireAccountId } from '~api/policy.server';
import { WorkspaceClient } from '~api/workspace/api';
import { Button, PageHeader } from '~components';
import TxnList from '~components/account/txn-list';
import { postTxnPayloadSchema } from './ws.$workspaceId.a.$accountId.post-txn';
import { mapNonEmpty } from '~api/array';
import { Txn } from '~components/account/txn-form-schema';
import { useModal } from '~hooks';

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
    txns,
    balances
  };
};

export default function () {
  const { workspaceId, accountId, currencies, ...loadData } =
    useLoaderData<ReturnTypePromise<typeof loader>>();
  const modals = useModal();
  const fetcher = useFetcher();
  const [editMode, setEditMode] = useState<
    { editing: true; editedId: number | null } | { editing: false }
  >({ editing: false });
  const account = loadData.accounts.find((a) => a.id === accountId)!;
  const currency = currencies.find((c) => c.id === account.currency_id)!;
  const balance = loadData.balances[account.currency_id]?.accounts[account.id.toString()] ?? 0;
  const ttt = loadData.txns.reduce(
    ([bal, acc], t) =>
      [
        bal - t.data.reduce((acc, d) => d.amount + acc, 0),
        [
          ...acc,
          {
            txnId: t.id,
            balance: bal,
            date: new Date(t.date),
            notes: t.notes,
            data: t.data,
            meta: t.meta
          }
        ]
      ] as [number, Txn[]],
    [balance, []] as [number, Txn[]]
  );

  const handlePostTransaction = () => {
    setEditMode({
      editing: true,
      editedId: null
    });
  };
  const handleCancel = () => {
    setEditMode({ editing: false });
  };
  const handleEdit = (t: FirstParam<FirstParam<typeof TxnList>['onRowEdit']>) => {
    setEditMode({
      editedId: t.txnId,
      editing: true
    });
  };

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.type === 'done') {
      handleCancel();
    }
  }, [fetcher.state, fetcher.type]);

  const handleImport = () => modals.importTransactions(workspaceId, accountId, currency.precision);

  const handleDelete = (txnId: number) => {
    fetcher.submit(
      {},
      {
        action: ROUTES.workspace(workspaceId)
          .account.item(accountId.toString())
          .txn(txnId.toString()).delete,
        method: 'delete'
      }
    );
  };

  const handleSaveTxn = (t: FirstParam<FirstParam<typeof TxnList>['onSubmit']>) => {
    if (!editMode.editing) return;

    submitJsonRequest(
      fetcher,
      ROUTES.workspace(workspaceId).account.item(accountId.toString()).postTransaction,
      postTxnPayloadSchema,
      {
        txnId: editMode.editedId === null ? undefined : editMode.editedId,
        note: t.notes,
        date: t.date,
        data: mapNonEmpty(t.data, (d) => {
          return {
            amount: d.amount,
            payee: d.payee ?? '',
            ...(d.category?.type === 'bucket'
              ? { type: 'external' as const, bucketId: d.category.bucketId }
              : d.category?.type === 'account'
              ? {
                  type: 'transfer' as const,
                  otherAccountId: d.category.accountId,
                  otherAmount: 'otherAmount' in d ? d.otherAmount ?? null : null
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
        <div className="flex justify-end gap-6">
          <Button type="button" onClick={handleImport}>
            Import QIF
          </Button>
          <Button type="button" onClick={handlePostTransaction}>
            Post Transaction
          </Button>
        </div>
      </nav>
      <div className="h-[calc(100vh-10rem)] w-full overflow-auto">
        <TxnList
          isLoading={fetcher.state !== 'idle'}
          onSubmit={handleSaveTxn}
          workspaceId={workspaceId}
          accountId={accountId}
          currencies={currencies}
          accounts={loadData.accounts.map((a) => ({ ...a, currency: a.currency_id }))}
          buckets={loadData.buckets}
          txns={ttt[1]}
          editMode={editMode.editing}
          editTxnId={editMode.editing ? editMode.editedId : null}
          onCancel={handleCancel}
          onRowEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
