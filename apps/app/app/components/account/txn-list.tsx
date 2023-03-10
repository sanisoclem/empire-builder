import { zodResolver } from '@hookform/resolvers/zod';
import { Fragment, useEffect } from 'react';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch
} from 'react-hook-form';
import { z } from 'zod';
import { Button, InputCategoryCombo } from '~components';
import Input from '~components/form/input';
import Textarea from '~components/form/textarea';

type Txn = {
  txnId: number;
  date: Date;
  notes: string;
  data: NonEmptyArray<
    | {
        type: 'draft';
        amount: number;
      }
    | {
        type: 'transfer';
        otherAccountId: number;
        otherAmount: number;
        amount: number;
      }
    | {
        type: 'external';
        bucketId: number;
        amount: number;
        payee: string;
      }
  >;
};
type Props = {
  workspaceId: string;
  accountId: number;
  currencies: Array<{
    id: string;
    name: string;
    precision: Number;
  }>;
  accounts: Array<{
    id: number;
    name: string;
    currency: string;
  }>;
  buckets: Array<{
    id: number;
    name: string;
    category: string | null;
  }>;
  editMode: boolean;
  editTxnId: number | null;
  txns: Txn[];
  onCancel?: () => void;
};

type TxnRowProps = {
  accounts: Props['accounts'];
  buckets: Props['buckets'];
  txn: WithNullable<Txn, 'txnId'>;
};

function TxnRow({ accounts, buckets, txn }: TxnRowProps) {
  return (
    <tbody className="group">
      {txn.data.map((d, i) => (
        <tr
          key={i}
          className="h-1 bg-white group-hover:bg-stone-100 dark:divide-stone-700 dark:bg-stone-800 dark:group-hover:bg-stone-700"
        >
          {i === 0 && (
            <td
              rowSpan={txn.data.length}
              className="h-full cursor-pointer whitespace-nowrap px-1 py-2 text-sm font-normal text-stone-500 dark:text-stone-400"
            >
              <div className="flex h-full flex-col items-stretch">
                {txn.date.toLocaleDateString()}
              </div>
            </td>
          )}
          <td className="whitespace-nowrap px-1 py-2 font-medium text-stone-500">
            {d.type === 'draft'
              ? ''
              : d.type === 'transfer'
              ? d.amount > 0
                ? `Transfer from: ${accounts.find((a) => a.id === d.otherAccountId)!.name}`
                : `Transfer to: ${accounts.find((a) => a.id === d.otherAccountId)!.name}`
              : `${buckets.find((a) => a.id === d.bucketId)!.category}: ${
                  buckets.find((a) => a.id === d.bucketId)!.name
                }`}
          </td>
          <td className="whitespace-nowrap px-1 py-2 font-medium text-stone-500">
            {'payee' in d && d.payee}
          </td>
          {i === 0 && (
            <td rowSpan={txn.data.length} className="h-full px-1 py-2 font-medium text-stone-500">
              {txn.notes}
            </td>
          )}
          <td className="whitespace-nowrap px-1 py-2 font-medium text-stone-500">
            {d.type === 'transfer' &&
              d.amount !== d.otherAccountId &&
              (d.otherAccountId / Math.pow(10, 2)).toFixed(2)}
          </td>
          <td className="whitespace-nowrap px-1 py-2 font-medium text-stone-500">
            {(d.amount / Math.pow(10, 2)).toFixed(2)}
          </td>
          {i === 0 && (
            <td className="h-full whitespace-nowrap px-1 py-2 text-right font-medium text-stone-500">
              <div className="flex h-full flex-col items-stretch">0.00</div>
            </td>
          )}
        </tr>
      ))}
    </tbody>
  );
}

type TxEditProps = {
  currency: string;
  categories: Array<{ id: string; name: string; category: string }>;
  onCancel?: () => void;
};

function TxnEdit({ categories, onCancel, currency }: TxEditProps) {
  const { control, register } = useFormContext<z.infer<typeof formSchema>>();
  const { fields } = useFieldArray({ control, name: 'data' });
  const data = useWatch({ control, name: 'data' });

  return (
    <tbody className="group">
      {fields.map((f, i) => (
        <tr
          key={i}
          className="h-1 bg-white group-hover:bg-stone-100 dark:divide-stone-700 dark:bg-stone-800 dark:group-hover:bg-stone-700"
        >
          {i === 0 && (
            <td
              rowSpan={fields.length}
              className="h-full cursor-pointer whitespace-nowrap px-1 py-2 text-sm font-normal text-stone-500 dark:text-stone-400"
            >
              <div className="flex h-full flex-col items-stretch">
                <Input type="date" variant="sm" {...register('date', { valueAsDate: true })} />
              </div>
            </td>
          )}
          <td className="whitespace-nowrap px-1 py-2 font-medium text-stone-500">
            <Controller
              name={`data.${i}.category`}
              control={control}
              render={({ field }) => (
                <InputCategoryCombo
                  variant="sm"
                  {...field}
                  placeholder="choose a category"
                  choices={categories}
                />
              )}
            />
          </td>
          <td className="whitespace-nowrap px-1 py-2 font-medium text-stone-500">
            {data[i].category?.type === 'bucket' && (
              <Input
                placeholder="payee"
                variant="sm"
                type="text"
                {...register(`data.${i}.payee`)}
              />
            )}
          </td>
          {i === 0 && (
            <td rowSpan={fields.length} className="h-full px-1 py-2 font-medium text-stone-500">
              <div className="flex h-full flex-col items-stretch">
                <Textarea
                  noresize={true}
                  variant="sm"
                  rows={1}
                  placeholder="notes"
                  {...register('notes')}
                />
              </div>
            </td>
          )}
          <td className="whitespace-nowrap px-1 py-2 font-medium text-stone-500">
            {(() => {
              let d = data[i]!;
              return (
                d.category?.type === 'account' &&
                d.category.currency !== currency && (
                  <Input
                    variant="sm"
                    type="number"
                    placeholder="other amount"
                    {...register(`data.${i}.otherAmount`, { valueAsNumber: true })}
                  />
                )
              );
            })()}
          </td>
          <td className="whitespace-nowrap px-1 py-2 font-medium text-stone-500">
            <Input
              variant="sm"
              type="number"
              placeholder="amount"
              {...register(`data.${i}.amount`, { valueAsNumber: true })}
            />
          </td>
          <td></td>
        </tr>
      ))}
      <tr>
        <td colSpan={7} className="space-x-2 p-2 text-center">
          <Button
            type="button"
            className="w-28 !p-1 text-center"
            variant="neutral"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" className="w-28 !p-1 text-center">
            Save
          </Button>
        </td>
      </tr>
    </tbody>
  );
}

const formSchema = z.object({
  date: z.date(),
  notes: z.string(),
  data: z.array(
    z.union([
      z.object({
        category: z.object({
          id: z.string(),
          accountId: z.number(),
          currency: z.string(),
          name: z.string(),
          category: z.string(),
          type: z.literal('account')
        }),
        amount: z.number(),
        otherAmount: z.number().nullable().optional()
      }),
      z.object({
        category: z.object({
          id: z.string(),
          bucketId: z.number(),
          name: z.string(),
          category: z.string(),
          type: z.literal('bucket')
        }),
        amount: z.number(),
        payee: z.string()
      }),
      z.object({
        category: z.null(),
        amount: z.number()
      })
    ])
  )
});

export default function TxnList({
  workspaceId,
  currencies,
  accountId,
  accounts,
  buckets,
  txns,
  editMode,
  editTxnId,
  onCancel
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
    console.log(e);
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
            notes: txn.notes,
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
              {!editMode || editTxnId !== txn.txnId}
              <TxnRow accounts={accounts} buckets={buckets} txn={txn} />
            </Fragment>
          ))}
        </table>
      </form>
    </FormProvider>
  );
}
