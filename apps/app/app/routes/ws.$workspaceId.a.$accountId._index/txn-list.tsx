import { Fragment } from 'react';
import { z } from 'zod';
import { formSchema, Txn } from './txn-form-schema';
import TxnRow from './txn-row';
import TxnEdit from './txn-row-edit';

type Props = {
  workspaceId: string;
  accountId: number;
  isLoading: boolean;
  currencies: Array<{
    id: string;
    name: string;
    precision: number;
  }>;
  accounts: FirstParam<typeof TxnRow>['accounts'];
  buckets: FirstParam<typeof TxnRow>['buckets'];
  editMode: boolean;
  editTxnId: number | null;
  txns: Array<Txn>;
  onRowEdit?: (v: FirstParam<typeof TxnRow>['txn']) => void;
  onSubmit?: (v: z.infer<typeof formSchema>) => void;
  onDelete?: (txnId: number) => void;
  onCancel?: () => void;
};

export default function TxnList({
  accountId,
  accounts,
  currencies,
  buckets,
  txns,
  editMode,
  editTxnId,
  isLoading,
  onSubmit,
  onCancel,
  onRowEdit,
  onDelete
}: Props) {
  const account = accounts.find((a) => a.id === accountId)!;
  const currency = currencies.find((c) => c.id === account.currency)!;
  const filteredAccounts = accounts.filter((a) => a.id !== accountId);
  const categories = [
    ...filteredAccounts.map((a) => ({
      id: `A_${a.id}`,
      name: a.name,
      type: 'account' as const,
      accountId: a.id,
      currency: a.currency,
      precision: currencies.find((c) => c.id === a.currency)!.precision,
      category: 'Account'
    })),
    ...buckets.map((b) => ({
      ...b,
      type: 'bucket' as const,
      id: `B_${b.id}`,
      bucketId: b.id,
      category: b.category ?? 'Uncategorized'
    }))
  ];
  const handleSubmitTxn = (e: FirstParam<typeof onSubmit>) => {
    onSubmit?.(e);
  };

  return (
    <form>
      <table className="relative min-w-full table-fixed divide-y divide-stone-200 dark:divide-stone-600">
        <colgroup className="w-40" />
        <colgroup className=" min-w-[15rem]" />
        <colgroup className="w-40 2xl:w-80" />
        <colgroup className="w-60  2xl:w-80" />
        <colgroup className="w-36" />
        <colgroup className="w-36" />
        <colgroup className="w-36" />
        <thead className="sticky top-0 bg-stone-100 uppercase dark:bg-stone-800">
          <tr>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase text-stone-500 dark:text-stone-300"
            >
              Date
            </th>
            <th
              scope="col"
              className="whitespace-nowrap px-4 py-2 text-left text-xs font-medium uppercase text-stone-500 dark:text-stone-300"
            >
              Category
            </th>
            <th
              scope="col"
              className="whitespace-nowrap px-4 py-2 text-left text-xs font-medium uppercase text-stone-500 dark:text-stone-300"
            >
              Payee
            </th>
            <th
              scope="col"
              className="whitespace-nowrap px-4 py-2 text-left text-xs font-medium uppercase text-stone-500 dark:text-stone-300"
            >
              Notes
            </th>
            <th
              scope="col"
              className="whitespace-nowrap px-4 py-2 text-left text-xs font-medium uppercase text-stone-500 dark:text-stone-300"
            >
              X Amount
            </th>
            <th
              scope="col"
              className="whitespace-nowrap px-4 py-2 text-left text-xs font-medium uppercase text-stone-500 dark:text-stone-300"
            >
              Amount
            </th>
            <th
              scope="col"
              className="whitespace-nowrap px-4 py-2 text-left text-xs font-medium uppercase text-stone-500 dark:text-stone-300"
            >
              Balance
            </th>
          </tr>
        </thead>
        {editMode && editTxnId === null && (
          <TxnEdit
            isLoading={isLoading}
            currency={account.currency}
            precision={currency.precision}
            categories={categories}
            onCancel={onCancel}
            onSubmit={handleSubmitTxn}
            onDelete={onDelete}
          />
        )}
        {txns.map((txn) => (
          <Fragment key={txn.txnId}>
            {editMode && editTxnId === txn.txnId && (
              <TxnEdit
                isLoading={isLoading}
                currency={account.currency}
                precision={currency.precision}
                txn={txn}
                categories={categories}
                onCancel={onCancel}
                onSubmit={handleSubmitTxn}
                onDelete={onDelete}
              />
            )}
            {(!editMode || editTxnId !== txn.txnId) && (
              <TxnRow
                currencies={currencies}
                accountId={accountId}
                onClick={onRowEdit}
                accounts={accounts}
                buckets={buckets}
                txn={txn}
              />
            )}
          </Fragment>
        ))}
      </table>
    </form>
  );
}
