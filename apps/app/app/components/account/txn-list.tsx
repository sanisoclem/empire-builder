import { InputCategoryCombo } from '~components';
import Input from '~components/form/input';

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
  editing?: WithNullable<Txn, 'txnId'>;
  txns: Txn[];
};

type TxnRowProps = {
  editMode: boolean;
  accounts: Props['accounts'];
  buckets: Props['buckets'];
  txn: WithNullable<Txn, 'txnId'>;
  d: Txn['data'][number];
  i: number;
};

function TxnRow({ editMode, accounts, buckets, txn, d, i }: TxnRowProps) {
  const categories = [
    ...accounts.map((a) => ({
      id: `A_${a.id}`,
      name: a.name,
      category: 'Account'
    })),
    ...buckets.map((b) => ({
      ...b,
      id: `B_${b.id}`,
      category: b.category ?? 'Uncategorized'
    }))
  ];
  return (
    <tr className="hover:bg-stone-100 dark:hover:bg-stone-700">
      {i === 0 && (
        <td
          rowSpan={txn.data.length}
          className="w-40  cursor-pointer whitespace-nowrap px-4 py-2 text-sm font-normal text-stone-500 dark:text-stone-400"
        >
          {editMode && <Input placeholder='text' type="date" defaultValue={txn.date.toLocaleDateString()} />}
          {!editMode && txn.date.toLocaleDateString()}
        </td>
      )}
      <td className="whitespace-nowrap px-4 py-2 font-medium text-stone-500">
        {editMode && <InputCategoryCombo choices={categories} />}
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
      <td className="whitespace-nowrap px-4 py-2 font-medium text-stone-500">
        {'payee' in d && d.payee}
      </td>
      {i === 0 && (
        <td
          rowSpan={txn.data.length}
          className="whitespace-nowrap px-4 py-2 font-medium text-stone-500"
        >
          {txn.notes}
        </td>
      )}
      <td className="whitespace-nowrap px-4 py-2 font-medium text-stone-500">
        {d.type === 'transfer' &&
          d.amount !== d.otherAccountId &&
          (d.otherAccountId / Math.pow(10, 2)).toFixed(2)}
      </td>
      <td className="whitespace-nowrap px-4 py-2 font-medium text-stone-500">
        {(d.amount / Math.pow(10, 2)).toFixed(2)}
      </td>
    </tr>
  );
}

export default function TxnList({
  workspaceId,
  currencies,
  accountId,
  accounts,
  buckets,
  txns,
  editing
}: Props) {
  const account = accounts.find((a) => a.id === accountId)!;
  const currency = currencies.find((c) => account.currency === c.id)!;
  const hydratedTxns = txns.map((txn) =>
    txn.data.map((d) => ({
      ...d,
      ...(d.type === 'transfer'
        ? {
            otherAccount: accounts.find((a) => a.id === d.otherAccountId)!
          }
        : {})
    }))
  );
  return (
    <>
      <table className="relative min-w-full table-fixed divide-y divide-stone-200 dark:divide-stone-600">
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
        <tbody className="divide-y divide-stone-200 bg-white dark:divide-stone-700 dark:bg-stone-800">
          {editing !== undefined &&
            editing.txnId === null &&
            editing.data.map((d, i) => (
              <TxnRow
                editMode={true}
                accounts={accounts}
                buckets={buckets}
                txn={editing}
                d={d}
                i={i}
              />
            ))}
          {txns.map((txn) =>
            txn.data.map((d, i) => (
              <TxnRow
                editMode={txn.txnId === editing?.txnId}
                key={`${txn.txnId}_${i}`}
                accounts={accounts}
                buckets={buckets}
                txn={txn}
                d={d}
                i={i}
              />
            ))
          )}
        </tbody>
      </table>
    </>
  );
}
