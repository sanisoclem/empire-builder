import { zodResolver } from '@hookform/resolvers/zod';
import { Fragment, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { formSchema } from './txn-form-schema';
import TxnRow from './txn-row';
import TxnEdit from './txn-row-edit';

type Props = {
  workspaceId: string;
  accountId: number;
  currencies: Array<{
    id: string;
    name: string;
    precision: Number;
  }>;
  accounts: FirstParam<typeof TxnRow>['accounts'];
  buckets: FirstParam<typeof TxnRow>['buckets'];
  editMode: boolean;
  editTxnId: number | null;
  txns: Array<FirstParam<typeof TxnRow>['txn']>;
  onRowEdit?: (v: FirstParam<typeof TxnRow>['txn']) => void;
  onSubmit?: (v: z.infer<typeof formSchema>) => void;
  onCancel?: () => void;
};

export default function TxnList({
  accountId,
  accounts,
  buckets,
  txns,
  editMode,
  editTxnId,
  onSubmit,
  onCancel,
  onRowEdit
}: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema)
  });
  const account = accounts.find((a) => a.id === accountId)!;
  const filteredAccounts = accounts.filter((a) => a.id !== accountId);
  const { handleSubmit, reset } = form;
  const categories = [
    ...filteredAccounts.map((a) => ({
      id: `A_${a.id}`,
      name: a.name,
      type: 'account' as const,
      accountId: a.id,
      currency: a.currency,
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
  const handleSubmitTxn = (e: unknown) => {
    onSubmit?.(formSchema.parse(e));
  };

  useEffect(() => {
    if (editMode) {
      if (editTxnId === null) {
        reset({
          data: [{}]
        });
      } else {
        const txn = txns.find((t) => t.txnId === editTxnId);
        if (txn !== undefined) {
          reset({
            date: txn.date,
            notes: txn.notes ?? '',
            data: txn.data.map((d) =>
              d.type === 'draft'
                ? { category: null, amount: d.amount }
                : d.type === 'external'
                ? {
                    category: categories.find(
                      (c) => c.type === 'bucket' && c.bucketId === d.bucketId
                    )!,
                    amount: d.amount,
                    payee: d.payee
                  }
                : {
                    category: categories.find(
                      (c) => c.type === 'account' && c.accountId === d.otherAccountId
                    )!,
                    amount: d.amount,
                    otherAmount: d.otherAmount
                  }
            )
          });
        }
      }
    }
  }, [editMode, editTxnId]);

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(handleSubmitTxn, console.log)}>
        <table className="relative min-w-full table-fixed divide-y divide-stone-200 dark:divide-stone-600">
          <colgroup className="w-40" />
          <colgroup className="" />
          <colgroup className="w-40" />
          <colgroup className="w-60" />
          <colgroup className="w-28" />
          <colgroup className="w-28" />
          <colgroup className="w-28" />
          <thead className="sticky top-0 bg-stone-100 uppercase dark:bg-stone-700">
            <tr>
              <th
                scope="col"
                className="px-4 py-2 text-left text-xs font-medium uppercase text-stone-500 dark:text-stone-400"
              >
                Date
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-4 py-2 text-left text-xs font-medium uppercase text-stone-500 dark:text-stone-400"
              >
                Category
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-4 py-2 text-left text-xs font-medium uppercase text-stone-500 dark:text-stone-400"
              >
                Payee
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-4 py-2 text-left text-xs font-medium uppercase text-stone-500 dark:text-stone-400"
              >
                Notes
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-4 py-2 text-left text-xs font-medium uppercase text-stone-500 dark:text-stone-400"
              >
                X Amount
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-4 py-2 text-left text-xs font-medium uppercase text-stone-500 dark:text-stone-400"
              >
                Amount
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-4 py-2 text-left text-xs font-medium uppercase text-stone-500 dark:text-stone-400"
              >
                Balance
              </th>
            </tr>
          </thead>
          {editMode && editTxnId === null && (
            <TxnEdit currency={account.currency} categories={categories} onCancel={onCancel} />
          )}
          {txns.map((txn) => (
            <Fragment key={txn.txnId}>
              {editMode && editTxnId === txn.txnId && (
                <TxnEdit currency={account.currency} categories={categories} onCancel={onCancel} />
              )}
              {(!editMode || editTxnId !== txn.txnId) && (
                <TxnRow onClick={onRowEdit} accounts={accounts} buckets={buckets} txn={txn} />
              )}
            </Fragment>
          ))}
        </table>
      </form>
    </FormProvider>
  );
}
