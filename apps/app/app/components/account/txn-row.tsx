import { Txn } from './txn-form-schema';

type TxnRowProps = {
  accountId: number;
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
  currencies: Array<{
    id: string;
    name: string;
    precision: number;
  }>;
  txn: Txn;
  onClick?: (v: Txn) => void;
};

export default function TxnRow({
  accountId,
  accounts,
  buckets,
  txn,
  currencies,
  onClick
}: TxnRowProps) {
  return (
    <tbody className="group" onClick={() => onClick?.(txn)}>
      {txn.data.map((d, i) => (
        <tr
          key={i}
          className="h-1 bg-white group-hover:bg-stone-100 dark:divide-stone-700 dark:bg-stone-800 dark:group-hover:bg-stone-700"
        >
          {i === 0 && (
            <td
              rowSpan={txn.data.length}
              className="h-full cursor-pointer whitespace-nowrap p-3 text-sm font-normal text-stone-500 dark:text-stone-400"
            >
              <div className="flex h-full flex-col items-stretch">
                {txn.date.toLocaleDateString()}
              </div>
            </td>
          )}
          <td className="whitespace-nowrap p-3 font-medium text-stone-500">
            {d.type === 'draft'
              ? 'Uncategorized'
              : d.type === 'transfer'
              ? d.amount > 0
                ? `Transfer from: ${accounts.find((a) => a.id === d.otherAccountId)!.name}`
                : `Transfer to: ${accounts.find((a) => a.id === d.otherAccountId)!.name}`
              : `${buckets.find((a) => a.id === d.bucketId)!.category}: ${
                  buckets.find((a) => a.id === d.bucketId)!.name
                }`}
          </td>
          <td className="whitespace-nowrap p-3 font-medium text-stone-500">
            {'payee' in d && d.payee}
          </td>
          {i === 0 && (
            <td rowSpan={txn.data.length} className="h-full p-3 font-medium text-stone-500">
              {txn.notes}
            </td>
          )}
          <td className="whitespace-nowrap p-3 font-medium text-stone-500">
            {d.type === 'transfer' &&
              d.otherAmount &&
              (
                d.otherAmount /
                Math.pow(
                  10,
                  currencies.find(
                    (c) => c.id === accounts.find((a) => a.id === d.otherAccountId)!.currency
                  )!.precision
                )
              ).toFixed(
                currencies.find(
                  (c) => c.id === accounts.find((a) => a.id === d.otherAccountId)!.currency
                )!.precision
              )}
          </td>
          <td className="whitespace-nowrap p-3 font-medium text-stone-500">
            {(
              d.amount /
              Math.pow(
                10,
                currencies.find((c) => c.id === accounts.find((a) => a.id === accountId)!.currency)!
                  .precision
              )
            ).toFixed(
              currencies.find((c) => c.id === accounts.find((a) => a.id === accountId)!.currency)!
                .precision
            )}
          </td>
          {i === 0 && (
            <td
              rowSpan={txn.data.length}
              className="h-full whitespace-nowrap p-3 text-right font-medium text-stone-500"
            >
              <div className="flex h-full flex-col items-stretch">
                {(
                  txn.balance /
                  Math.pow(
                    10,
                    currencies.find(
                      (c) => c.id === accounts.find((a) => a.id === accountId)!.currency
                    )!.precision
                  )
                ).toFixed(
                  currencies.find(
                    (c) => c.id === accounts.find((a) => a.id === accountId)!.currency
                  )!.precision
                )}
              </div>
            </td>
          )}
        </tr>
      ))}
    </tbody>
  );
}
